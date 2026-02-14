import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    verifyRefreshToken,
    generateTokens,
    setAuthCookies,
} from '@/lib/auth/session';

export async function POST(req: NextRequest) {
    try {
        const refreshToken = (await cookies()).get('refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'No refresh token' },
                { status: 401 }
            );
        }

        const payload = verifyRefreshToken(refreshToken);

        const tokens = generateTokens({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        });

        await setAuthCookies(tokens.accessToken, tokens.refreshToken);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid refresh token' },
            { status: 401 }
        );
    }
}
