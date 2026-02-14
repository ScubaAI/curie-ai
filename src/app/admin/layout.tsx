import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, PlusCircle, ShieldAlert, Database, Users, Settings, LogOut, ShoppingBag } from 'lucide-react';
import { LogoutButton } from "@/components/admin/LogoutButton";
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessToken();

  if (!token) {
    redirect('/login');
  }

  try {
    const payload = verifyAccessToken(token);
    if (payload.role !== 'ADMIN') {
      redirect('/login');
    }
  } catch (e) {
    redirect('/login');
  }

  console.log('[AdminLayout] Rendering admin panel');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/30 to-black text-slate-100 flex overflow-hidden">
      {/* Sidebar fija – más alta, más imponente, glass subtle */}
      <aside className="w-72 bg-slate-950/90 border-r border-indigo-900/30 backdrop-blur-xl flex flex-col shadow-2xl shadow-black/60 z-20">
        {/* Header / Logo */}
        <div className="p-6 border-b border-indigo-900/20">
          <Link href="/admin" className="flex items-center gap-3 group">
            <Database className="w-7 h-7 text-violet-500 transition-transform group-hover:scale-110 group-hover:rotate-3" />
            <div>
              <span className="text-2xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Curie
              </span>
              <p className="text-xs text-indigo-400/70 mt-0.5">Control Total</p>
            </div>
          </Link>
        </div>

        {/* Navegación – más espaciada, hover glow sutil */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-indigo-950/40 hover:text-violet-300 transition-all duration-300 group"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-400 group-hover:text-violet-300 transition-colors" />
            <span className="font-medium">Dashboard General</span>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-indigo-950/40 hover:text-violet-300 transition-all duration-300 group"
          >
            <Users className="w-5 h-5 text-indigo-400 group-hover:text-violet-300 transition-colors" />
            <span className="font-medium">Gestión de Usuarios</span>
          </Link>

          <Link
            href="/admin/measurement"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-indigo-950/40 hover:text-violet-300 transition-all duration-300 group"
          >
            <PlusCircle className="w-5 h-5 text-indigo-400 group-hover:text-violet-300 transition-colors" />
            <span className="font-medium">Nueva Medición Manual</span>
          </Link>

          <Link
            href="/admin/shop"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-indigo-950/40 hover:text-violet-300 transition-all duration-300 group"
          >
            <ShoppingBag className="w-5 h-5 text-indigo-400 group-hover:text-violet-300 transition-colors" />
            <span className="font-medium">Gestión de Tienda</span>
          </Link>

          <Link
            href="/admin/events"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-indigo-950/40 hover:text-violet-300 transition-all duration-300 group"
          >
            <ShieldAlert className="w-5 h-5 text-amber-500 group-hover:text-amber-400 transition-colors" />
            <span className="font-medium">Eventos y Alertas</span>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-indigo-950/40 hover:text-violet-300 transition-all duration-300 group"
          >
            <Settings className="w-5 h-5 text-indigo-400 group-hover:text-violet-300 transition-colors" />
            <span className="font-medium">Configuración del Sistema</span>
          </Link>
        </nav>

        {/* Footer – minimal, con logout destacado */}
        <div className="p-4 border-t border-indigo-900/20 mt-auto">
          <LogoutButton />
          <p className="text-xs text-slate-600 mt-4 px-2 text-center">
            Curie Intelligence © {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Contenido principal – scroll independiente, padding generoso */}
      <main className="flex-1 overflow-y-auto bg-black/40">
        <div className="p-8 md:p-10 lg:p-12 max-w-[1800px] mx-auto">
          {/* Puedes agregar aquí un header de página dinámico si quieres */}
          {children}
        </div>
      </main>
    </div>
  );
}