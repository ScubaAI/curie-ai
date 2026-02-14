import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rotateString, getActiveKeyVersion } from '@/lib/encryption';

export const dynamic = 'force-dynamic';
export const maxDuration = 9; // Hobby = 10s → margen de 1s

const BATCH_SIZE = 20;
const MAX_RUNTIME_MS = 8000;
const LOCK_TTL_MINUTES = 15;

async function acquireLock(): Promise<boolean> {
    const lock = await prisma.cronLock.findFirst({
        where: { name: 'token-rotation' },
    });

    if (lock && lock.expiresAt > new Date()) {
        return false;
    }

    await prisma.cronLock.upsert({
        where: { name: 'token-rotation' },
        update: { expiresAt: new Date(Date.now() + LOCK_TTL_MINUTES * 60 * 1000) },
        create: {
            name: 'token-rotation',
            expiresAt: new Date(Date.now() + LOCK_TTL_MINUTES * 60 * 1000),
        },
    });

    return true;
}

async function releaseLock() {
    await prisma.cronLock.delete({ where: { name: 'token-rotation' } }).catch(() => { });
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const acquired = await acquireLock();
    if (!acquired) {
        return NextResponse.json({ message: 'Job locked by another instance' }, { status: 429 });
    }

    try {
        const startTime = Date.now();
        const targetVersion = getActiveKeyVersion();

        const outdated = await prisma.wearableConnection.findMany({
            where: {
                isActive: true,
                AND: [
                    {
                        OR: [
                            { tokenVersion: { lt: targetVersion } },
                            { tokenVersion: null },
                        ],
                    },
                    {
                        OR: [
                            { lastRotatedAt: null },
                            { lastRotatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                        ],
                    },
                ],
            },
            take: BATCH_SIZE,
            select: {
                id: true,
                accessToken: true,
                refreshToken: true,
                tokenVersion: true,
            },
            orderBy: { lastRotatedAt: 'asc' },
        });

        if (outdated.length === 0) {
            return NextResponse.json({
                message: 'No tokens need rotation',
                targetVersion,
                processed: 0,
            });
        }

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
            rotated: [] as string[],
        };

        await prisma.$transaction(async (tx) => {
            for (const conn of outdated) {
                if (Date.now() - startTime > MAX_RUNTIME_MS) {
                    results.errors.push('Timeout approaching, stopping batch');
                    break;
                }

                try {
                    const newAccess = conn.accessToken ? rotateString(conn.accessToken, targetVersion) : null;
                    const newRefresh = conn.refreshToken ? rotateString(conn.refreshToken, targetVersion) : null;

                    await tx.wearableConnection.update({
                        where: { id: conn.id },
                        data: {
                            accessToken: newAccess,
                            refreshToken: newRefresh,
                            tokenVersion: targetVersion,
                            lastRotatedAt: new Date(),
                            rotationRetryCount: { increment: 1 },
                        },
                    });

                    results.success++;
                    results.rotated.push(conn.id);
                } catch (err) {
                    results.failed++;
                    results.errors.push(`Conn ${conn.id}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        });

        const remaining = await prisma.wearableConnection.count({
            where: {
                isActive: true,
                AND: [
                    {
                        OR: [
                            { tokenVersion: { lt: targetVersion } },
                            { tokenVersion: null },
                        ],
                    },
                    {
                        OR: [
                            { lastRotatedAt: null },
                            { lastRotatedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
                        ],
                    },
                ],
            },
        });

        if (results.failed > 0) {
            await prisma.systemEvent.create({
                data: {
                    type: 'TOKEN_ROTATION_FAILURE',
                    severity: 'ERROR',
                    title: `${results.failed} tokens fallaron en rotación`,
                    description: `Batch de rotación a v${targetVersion}. Errores: ${results.errors.join(', ')}`,
                    data: { rotated: results.rotated, failedCount: results.failed },
                    isRead: false,
                    createdAt: new Date(),
                },
            });
        }

        return NextResponse.json({
            targetVersion,
            processed: results.success + results.failed,
            success: results.success,
            failed: results.failed,
            remaining,
            hasMore: remaining > 0,
            errors: results.errors.slice(0, 5),
        });
    } catch (err) {
        console.error('[ROTATE-TOKENS-CRON]', err);
        return NextResponse.json({ error: 'Internal error during rotation' }, { status: 500 });
    } finally {
        await releaseLock();
    }
}
