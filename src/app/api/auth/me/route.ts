import { NextResponse } from 'next/server';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const token = await getAccessToken();

        if (!token) {
            return NextResponse.json({ error: 'No token' }, { status: 401 });
        }

        const payload = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                image: true,
                patient: {
                    select: {
                        onboardingCompleted: true,
                        onboardingStep: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}
