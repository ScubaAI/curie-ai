import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateTokens } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { patient: true, doctor: true },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const { accessToken, refreshToken } = generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role as 'PATIENT' | 'DOCTOR' | 'ADMIN',
        });

        // Determinar redirect URL
        let redirectUrl = '/';
        if (user.role === 'PATIENT') {
            redirectUrl = user.patient?.onboardingCompleted
                ? '/overview'
                : `/step-${user.patient?.onboardingStep || 1}`;
        } else if (user.role === 'DOCTOR') {
            redirectUrl = '/dashboard';
        } else if (user.role === 'ADMIN') {
            redirectUrl = '/admin';
        }

        // Crear response JSON con información del usuario
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            redirect: redirectUrl,
        });

        // Setear cookies en la response
        response.cookies.set('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60,
            path: '/',
        });

        response.cookies.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error al iniciar sesión' },
            { status: 500 }
        );
    }
}