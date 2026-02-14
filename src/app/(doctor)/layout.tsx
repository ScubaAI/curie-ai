import { redirect } from 'next/navigation';
import Link from 'next/link';
import { User, LogOut, Users, LayoutDashboard } from 'lucide-react';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessToken();

  if (!token) {
    redirect('/login');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
    if (payload.role !== 'DOCTOR' && payload.role !== 'ADMIN') {
      redirect('/login');
    }
  } catch (e) {
    redirect('/login');
  }

  const doctorName = payload.email.split('@')[0] || 'Doctor';

  console.log('[DoctorLayout] Rendering authenticated doctor route for:', doctorName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black text-slate-100 flex flex-col">
      {/* Header glassmorphism + subtle emerald pulse */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-emerald-900/20 bg-slate-950/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 group"
            >
              <LayoutDashboard className="w-6 h-6 text-emerald-500 transition-transform group-hover:scale-110" />
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Curie Doctor
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors"
            >
              <Users className="w-4 h-4" />
              Pacientes
            </Link>

            {/* Solo visible para roles con acceso admin (puedes condicionar) */}
            {payload.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-slate-300 hover:text-violet-400 transition-colors"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-medium shadow-lg">
                {doctorName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{doctorName}</p>
                <p className="text-xs text-slate-500">Especialista</p>
              </div>
            </div>

            {/* Logout (puedes conectar con signOut de next-auth) */}
            <button className="text-slate-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal con padding para header fijo */}
      <main className="flex-1 pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer minimalista opcional */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950/80 text-center text-sm text-slate-600">
        Curie • Inteligencia médica con datos reales • {new Date().getFullYear()}
      </footer>
    </div>
  );
}