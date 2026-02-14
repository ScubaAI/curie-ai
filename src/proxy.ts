import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyTokenEdge, refreshAccessToken } from './lib/auth/session';

// Configuración de rutas por rol
const ROUTE_CONFIG = {
  public: ['/login', '/register', '/'],
  patient: ['/overview', '/step-1', '/step-2', '/step-3'],
  doctor: ['/dashboard', '/patient'],
  admin: ['/admin'],
  api: ['/api'],
} as const;

type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isPublic = ROUTE_CONFIG.public.some(p => pathname === p);
  const isApi = pathname.startsWith('/api/');
  const isPatientRoute = ROUTE_CONFIG.patient.some(p => pathname.startsWith(p));
  const isDoctorRoute = ROUTE_CONFIG.doctor.some(p => pathname.startsWith(p));
  const isAdminRoute = ROUTE_CONFIG.admin.some(p => pathname.startsWith(p));

  // 1. Rutas API: pasar siempre (ellas validan solas), pero inyectar user si token válido
  if (isApi) {
    const headers = new Headers(request.headers);
    if (accessToken) {
      try {
        const payload = await verifyTokenEdge(accessToken);
        headers.set('x-user-id', payload.userId);
        headers.set('x-user-role', payload.role);
        headers.set('x-user-email', payload.email);
      } catch {
        // API manejará 401 sola
      }
    }
    return NextResponse.next({ request: { headers } });
  }

  // 2. Rutas públicas: permitir siempre acceso a login/register si el usuario lo fuerza (ej: logout manual)
  if (isPublic) {
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.next();
    }

    if (!accessToken) return NextResponse.next();

    try {
      const payload = await verifyTokenEdge(accessToken);
      const dashboard = getDashboardForRole(payload.role);

      // Solo redirigir si está en una ruta pública que NO es su dashboard
      // Pero NO redirigir si ya está en dashboard o intentando logout
      if (
        pathname !== dashboard &&
        !pathname.startsWith(dashboard) &&
        !pathname.includes('/logout')
      ) {
        return NextResponse.redirect(new URL(dashboard, request.url));
      }
    } catch {
      // Token inválido → dejar pasar a login/register
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  // 3. Rutas protegidas: intentar refresh si access token falla
  if (!accessToken && !refreshToken) {
    return redirectToLogin(request, pathname);
  }

  let payload;
  try {
    payload = await verifyTokenEdge(accessToken!);
  } catch (err) {
    // Access token inválido → intentar refresh
    if (refreshToken) {
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        accessToken = newTokens.access_token;

        // Setear nuevas cookies
        const response = NextResponse.next();
        response.cookies.set('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60, // 15 min ejemplo
          path: '/',
        });
        // Opcional: actualizar refresh si vino nuevo
        if (newTokens.refresh_token) {
          response.cookies.set('refresh_token', newTokens.refresh_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 días
            path: '/',
          });
        }

        // Re-verificar con el nuevo access token
        payload = await verifyTokenEdge(accessToken);
      } catch (refreshErr) {
        console.error('[Middleware] Refresh failed:', refreshErr);
        return redirectToLogin(request, pathname);
      }
    } else {
      return redirectToLogin(request, pathname);
    }
  }

  // 4. Verificar permisos
  const hasAccess = checkRoleAccess(payload.role as UserRole, {
    isPatientRoute,
    isDoctorRoute,
    isAdminRoute,
    pathname,
  });

  if (!hasAccess) {
    const dashboard = getDashboardForRole(payload.role);
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // 5. Inyectar headers para server components
  const headers = new Headers(request.headers);
  headers.set('x-user-id', payload.userId);
  headers.set('x-user-role', payload.role);
  headers.set('x-user-email', payload.email);

  return NextResponse.next({ request: { headers } });
}

// Helpers
function redirectToLogin(request: NextRequest, currentPath: string) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', currentPath);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.delete('access_token');
  res.cookies.delete('refresh_token');
  return res;
}

function getDashboardForRole(role: string): string {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'DOCTOR': return '/dashboard';
    case 'PATIENT': return '/overview';
    default: return '/';
  }
}

function checkRoleAccess(
  role: UserRole,
  { isPatientRoute, isDoctorRoute, isAdminRoute, pathname }: {
    isPatientRoute: boolean;
    isDoctorRoute: boolean;
    isAdminRoute: boolean;
    pathname: string;
  }
): boolean {
  if (role === 'ADMIN') return true;

  if (role === 'DOCTOR') {
    return isDoctorRoute || isPatientRoute;
  }

  if (role === 'PATIENT') {
    return isPatientRoute;
  }

  return false;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|videos|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)',
  ],
};