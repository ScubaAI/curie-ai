import Link from "next/link";
import { Activity, PlusCircle, LayoutDashboard } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="text-2xl font-black text-cyan-500">
            Curie
          </Link>
          <p className="text-xs text-slate-500 mt-1">Panel de Administración</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link
            href="/admin/measurement"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium">Nueva Medición</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            © 2024 Curie Intelligence
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
