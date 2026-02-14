import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Activity, User, HeartPulse, LogOut } from 'lucide-react';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';

export default async function PatientLayout({
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
    if (payload.role !== 'PATIENT' && payload.role !== 'ADMIN') {
      redirect('/login');
    }
  } catch (e) {
    redirect('/login');
  }

  const patientName = payload.email.split('@')[0] || "Paciente";
  const avatarInitial = patientName.charAt(0).toUpperCase();

  console.log('[PatientLayout] Rendering authenticated patient route for:', patientName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-slate-100 flex flex-col">
      {/* Header glass con calidez sutil – cyan + rose undertone */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-900/20 bg-slate-950/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/overview"
            className="flex items-center gap-3 group"
          >
            <HeartPulse className="w-6 h-6 text-cyan-500 transition-transform group-hover:scale-110 group-hover:text-cyan-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Curie
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/overview"
              className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <Activity className="w-4 h-4" />
              Mi Resumen
            </Link>
            {/* Puedes agregar más: Historial, Dispositivos, Consultas futuras, etc. */}
          </nav>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-medium shadow-lg shadow-cyan-950/30">
                {avatarInitial}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{patientName}</p>
                <p className="text-xs text-slate-500">Tú</p>
              </div>
            </div>

            {/* Logout sutil */}
            <button
              className="text-slate-400 hover:text-rose-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal – padding para header fijo + ritmo más humano */}
      <main className="flex-1 pt-20 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Opcional: Greeting personal que aparece solo en /overview o como hero en sub-páginas */}
          {children}
        </div>
      </main>

      {/* Footer discreto – refuerza confianza */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950/80 text-center text-sm text-slate-600">
        Curie • Tus datos, tu cuerpo, tu poder • {new Date().getFullYear()}
      </footer>
    </div>
  );
}