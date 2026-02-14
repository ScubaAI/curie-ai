// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeartPulse, User, Stethoscope, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }), // ← agregamos role explícito si tu backend lo necesita
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Redirección suave (puedes usar router.push si usas useRouter)
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fondo glow lejano – neuro-triggers sutiles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(6,182,212,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo con pulso */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <HeartPulse className="w-10 h-10 text-cyan-500 animate-pulse-slow" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
              Curie
            </h1>
          </div>
          <p className="text-slate-400 text-lg">Tu cuerpo. Tu inteligencia. Tu poder.</p>
        </div>

        {/* Tarjeta principal – glass húmedo, glow en focus */}
        <div className="relative bg-slate-950/60 backdrop-blur-2xl border border-slate-700/30 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/70 overflow-hidden">
          {/* Glow overlay que responde a interacciones */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

          <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
            Bienvenido de nuevo
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-950/30 border border-rose-800/40 rounded-xl text-rose-300 text-sm flex items-center gap-3">
              <span className="text-rose-400">!</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Toggle de rol – con iconos y glow */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`group relative flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-400 ${role === 'patient'
                    ? 'bg-cyan-950/50 border-cyan-600/50 shadow-cyan-950/30'
                    : 'bg-slate-900/40 border-slate-800/40 hover:border-cyan-800/30'
                  } border`}
              >
                <HeartPulse
                  className={`w-6 h-6 transition-colors ${role === 'patient' ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-500'
                    }`}
                />
                <span className={`text-sm font-medium ${role === 'patient' ? 'text-cyan-300' : 'text-slate-400'}`}>
                  Paciente
                </span>
                {role === 'patient' && (
                  <div className="absolute inset-0 rounded-2xl bg-cyan-500/10 animate-pulse-slow pointer-events-none" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`group relative flex flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-400 ${role === 'doctor'
                    ? 'bg-emerald-950/50 border-emerald-600/50 shadow-emerald-950/30'
                    : 'bg-slate-900/40 border-slate-800/40 hover:border-emerald-800/30'
                  } border`}
              >
                <Stethoscope
                  className={`w-6 h-6 transition-colors ${role === 'doctor' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-500'
                    }`}
                />
                <span className={`text-sm font-medium ${role === 'doctor' ? 'text-emerald-300' : 'text-slate-400'}`}>
                  Doctor
                </span>
                {role === 'doctor' && (
                  <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-pulse-slow pointer-events-none" />
                )}
              </button>
            </div>

            {/* Inputs con glow al focus */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700/40 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  placeholder="tu@nombre.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2 font-medium">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-700/40 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Botón principal – gradiente vivo */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all duration-500 shadow-lg shadow-cyan-950/30 hover:shadow-cyan-900/50 disabled:opacity-50 group overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Iniciando sesión…
                  </>
                ) : (
                  'Entrar'
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              ¿Aún no formas parte de Curie?{' '}
              <Link
                href="/register"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Crea tu cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}