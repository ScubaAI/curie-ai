// app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HeartPulse, UserPlus, Loader2, CheckCircle2 } from 'lucide-react';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null); // limpiar error al escribir
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^A-Za-z0-9]/)) strength++;

    const colors = ['bg-rose-500', 'bg-amber-500', 'bg-cyan-400', 'bg-cyan-600'];
    const labels = ['Débil', 'Regular', 'Bueno', 'Fuerte'];

    return { strength: Math.min(strength, 4), colors, labels };
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TODO: Implementar registro real (Supabase, Clerk, Firebase, tu /api/auth/register)
      console.log('Registrando:', formData.email);

      // Simulación API
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setSuccess(true);
      // En producción: redirigir a onboarding o dashboard
      setTimeout(() => {
        window.location.href = '/onboarding/step-1';
      }, 1500);
    } catch (err) {
      setError('Registro fallido. Intenta de nuevo.');
      console.error('Error de registro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fondos glow sutiles – neuro-triggers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.10)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(244,63,94,0.06)_0%,transparent_65%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header con pulso */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <UserPlus className="w-10 h-10 text-cyan-500 animate-pulse-slow" />
            <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-rose-400 bg-clip-text text-transparent">
              Curie
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            Despierta tu soberanía biológica
          </p>
        </div>

        {/* Tarjeta glass premium */}
        <div className="relative bg-slate-950/65 backdrop-blur-2xl border border-cyan-900/25 rounded-3xl p-8 md:p-10 shadow-2xl shadow-black/70 overflow-hidden">
          {/* Overlay glow dinámico */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-cyan-500/8 via-transparent to-rose-500/5 opacity-60 transition-opacity duration-1000" />

          <h2 className="text-3xl font-bold text-white mb-8 text-center tracking-tight">
            Crea tu cuenta
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-sm flex items-center gap-3">
              <span className="text-rose-400 font-bold">!</span> {error}
            </div>
          )}

          {success ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-cyan-400 mx-auto animate-pulse" />
              <h3 className="text-2xl font-bold text-cyan-300">¡Bienvenido a Curie!</h3>
              <p className="text-slate-300">Redirigiendo a tu onboarding...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm text-slate-400 mb-2 font-medium">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-700/40 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300"
                  placeholder="tu@nombre.com"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm text-slate-400 mb-2 font-medium">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-700/40 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />

                {formData.password && (
                  <div className="mt-3">
                    <div className="flex gap-1.5 mb-2">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-400 ${level <= passwordStrength.strength
                              ? passwordStrength.colors[passwordStrength.strength - 1]
                              : 'bg-slate-800'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {passwordStrength.labels[passwordStrength.strength - 1]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-slate-400 mb-2 font-medium">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-950/60 border border-slate-700/40 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300"
                  placeholder="Repite tu contraseña"
                  autoComplete="new-password"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="mt-1.5 w-5 h-5 rounded border-slate-600 text-cyan-600 focus:ring-cyan-500/30 bg-slate-950/60"
                />
                <label htmlFor="acceptTerms" className="text-sm text-slate-400 leading-relaxed">
                  Acepto los{' '}
                  <Link href="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Términos de Servicio
                  </Link>{' '}
                  y la{' '}
                  <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full py-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-rose-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-rose-500 text-white font-semibold rounded-xl transition-all duration-500 shadow-lg shadow-cyan-950/30 hover:shadow-cyan-900/50 disabled:opacity-50 group overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creando tu cuenta…
                    </>
                  ) : (
                    'Crear mi cuenta'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              ¿Ya eres parte de Curie?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}