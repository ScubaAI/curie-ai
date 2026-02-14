// app/(auth)/layout.tsx
import Link from 'next/link';
import { HeartPulse } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black flex flex-col relative overflow-hidden">
      {/* Fondo sutil con partículas o glow lejano – opcional con CSS o canvas después */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.08)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.05)_0%,transparent_60%)] pointer-events-none" />

      {/* Header minimal – logo con pulso */}
      <header className="relative z-10 p-8 md:p-12">
        <div className="max-w-md mx-auto flex items-center justify-center">
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <HeartPulse
              className="w-8 h-8 text-cyan-500 transition-all duration-500 group-hover:scale-110 group-hover:text-cyan-400"
            />
            <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Curie
            </h1>
          </Link>
        </div>
      </header>

      {/* Contenido central – centrado vertical, con breathing room */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          {/* Tarjeta contenedora con glassmorphism premium */}
          <div className="relative bg-slate-950/60 backdrop-blur-xl border border-cyan-900/20 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/70">
            {/* Glow sutil en bordes */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/5 via-transparent to-rose-500/5 pointer-events-none" />

            {children}
          </div>
        </div>
      </main>

      {/* Footer discreto – confianza sin interrumpir */}
      <footer className="relative z-10 p-8 text-center text-sm text-slate-500">
        <div className="max-w-md mx-auto">
          <p>
            Al continuar, aceptas nuestros{' '}
            <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Política de Privacidad
            </Link>
          </p>
          <p className="mt-3 text-slate-600">
            Tu cuerpo. Tus datos. Tu poder.
          </p>
        </div>
      </footer>
    </div>
  );
}