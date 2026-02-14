'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Smartphone, CheckCircle2 } from 'lucide-react'; // Añadí icons para más polish

export default function WearablesPage() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleWithingsConnect = () => {
    setIsLoading(true);
    window.location.href = '/api/auth/withings';
  };

  const handleSkip = async () => {
    setIsLoading(true);
    // TODO: Save skipped status via API
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);
    router.push('/step-3');
  };

  const handleContinue = async () => {
    setIsLoading(true);
    // TODO: Save connection status via API
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);
    router.push('/step-3');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Header – mismo tono hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-sm">
            <Smartphone className="w-4 h-4" />
            Conexión de dispositivos
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Conecta tus wearables
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto">
            Sincroniza tus datos de salud automáticamente para insights más precisos y personalizados.
          </p>
        </div>

        {/* Withings Card – alineada con el mockup del hero */}
        <div
          className={`border rounded-2xl p-6 transition-all duration-300 ${isConnected
              ? 'border-emerald-500/50 bg-emerald-950/30 shadow-emerald-950/20'
              : 'border-slate-800 bg-slate-900/50 hover:border-cyan-700/50 hover:shadow-cyan-950/10'
            }`}
        >
          <div className="flex items-start gap-5">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 ${isConnected
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400'
                }`}
            >
              ⚖️
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-white">Withings Body Scan</h3>
                {isConnected && (
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                    Conectado
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm">
                Escala inteligente que mide peso, composición corporal, ritmo cardíaco y más — todo sincronizado automáticamente.
              </p>

              {!isConnected ? (
                <button
                  onClick={handleWithingsConnect}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-950/30"
                >
                  Conectar Withings
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsConnected(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 text-emerald-400 hover:text-emerald-300 font-semibold rounded-xl hover:bg-emerald-950/40 transition-colors"
                >
                  Desconectar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Other devices – sutil, coming soon */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-5">Otros dispositivos compatibles</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {['Apple Watch', 'Garmin', 'Oura Ring', 'Fitbit'].map((device) => (
              <div
                key={device}
                className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 text-center opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-slate-800 flex items-center justify-center text-2xl">
                  {device.includes('Watch') ? '⌚' : device.includes('Oura') ? '🔴' : '📱'}
                </div>
                <p className="text-sm font-medium text-slate-200">{device}</p>
                <p className="text-xs text-slate-500 mt-1">Próximamente</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits – soft cyan box como el del hero */}
        <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            ¿Por qué conectar tus dispositivos?
          </h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Monitoreo automático de sueño, actividad y frecuencia cardíaca
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Recomendaciones personalizadas basadas en datos reales
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Seguimiento preciso de progreso y metas de salud
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Detección temprana de patrones y riesgos
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
          >
            Saltar por ahora
          </button>
          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="flex-1 py-4 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-950/30"
          >
            {isLoading ? 'Guardando...' : 'Continuar'}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 pt-4">
          Puedes conectar dispositivos más tarde desde ajustes en tu dashboard.
        </p>
      </div>
    </div>
  );
}