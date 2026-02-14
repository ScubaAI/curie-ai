import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { HeartPulse, ChevronRight } from 'lucide-react';
import { getAccessToken, verifyAccessToken } from '@/lib/auth/session';

const steps = [
  { number: 1, name: 'Datos Básicos', path: '/step-1' },
  { number: 2, name: 'Dispositivos', path: '/step-2' },
  { number: 3, name: 'Laboratorio', path: '/step-3' },
];

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getAccessToken();
  if (!token) redirect('/login');

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (e) {
    redirect('/login');
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: payload.userId },
    select: { onboardingStep: true, onboardingCompleted: true },
  });

  if (patient?.onboardingCompleted) {
    redirect('/overview');
  }

  // Protección de flujo secuencial
  const headerList = await headers();
  const currentPath = headerList.get('x-current-path') || '';
  const currentStepMatch = currentPath.match(/step-(\d)/);
  const currentStepNumber = currentStepMatch ? parseInt(currentStepMatch[1]) : 1;

  if (currentStepNumber > (patient?.onboardingStep || 0) + 1) {
    redirect(`/onboarding/step-${(patient?.onboardingStep || 0) + 1}`);
  }

  const progress = (currentStepNumber / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-black text-slate-100 flex flex-col">
      {/* Progress header – glass, sutil glow cyan */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyan-900/20 bg-slate-950/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <HeartPulse className="w-6 h-6 text-cyan-500 transition-transform group-hover:scale-110" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Curie
              </span>
            </Link>

            <span className="text-sm text-slate-400">
              Paso {currentStepNumber} de {steps.length}
            </span>
          </div>

          {/* Barra de progreso con glow */}
          <div className="relative h-1.5 bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
            {/* Glow sutil en el borde del progreso */}
            <div
              className="absolute inset-y-0 bg-gradient-to-r from-cyan-400/30 to-transparent blur-sm transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Etiquetas de pasos – con indicador activo */}
          <div className="flex justify-between mt-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center gap-2 text-xs font-medium transition-colors ${step.number < currentStepNumber
                  ? 'text-cyan-400'
                  : step.number === currentStepNumber
                    ? 'text-white'
                    : 'text-slate-600'
                  }`}
              >
                {step.number < currentStepNumber ? (
                  <span className="w-5 h-5 rounded-full bg-cyan-900/50 flex items-center justify-center text-xs text-cyan-300">
                    ✓
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center">
                    {step.number}
                  </span>
                )}
                {step.name}
                {step.number < steps.length && (
                  <ChevronRight className="w-4 h-4 text-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Contenido principal – centrado, espacioso, con breathing room */}
      <main className="flex-1 pt-40 pb-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Footer suave – confianza y soporte */}
      <footer className="border-t border-slate-800 py-6 bg-slate-950/80 text-center text-sm text-slate-500">
        <div className="max-w-4xl mx-auto px-6">
          <p>¿Necesitas ayuda? Escríbenos a <span className="text-cyan-400">support@curie.health</span></p>
          <p className="mt-2">Tu transformación comienza aquí • Curie Intelligence</p>
        </div>
      </footer>
    </div>
  );
}