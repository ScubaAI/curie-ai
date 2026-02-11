'use client';

import { useState } from 'react';
import { Link2, Check, Activity, AlertCircle } from 'lucide-react';

interface WithingsConnectProps {
  patientId: string;
  isConnected?: boolean;
}

export default function WithingsConnect({ patientId, isConnected = false }: WithingsConnectProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Redirigir a tu endpoint de OAuth
    window.location.href = `/api/withings/auth?patientId=${patientId}`;
  };

  if (isConnected) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
          <Check size={24} className="text-emerald-400" />
        </div>
        <div>
          <h4 className="text-white font-medium">Body Scan conectado</h4>
          <p className="text-sm text-emerald-400/80">Sincronización activa</p>
        </div>
        <Activity size={20} className="text-emerald-400 ml-auto animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700/30 rounded-2xl p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
          <Activity size={24} className="text-emerald-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium mb-1">Vincular Body Scan</h4>
          <p className="text-sm text-slate-400">
            Conecta tu báscula Withings para ver métricas automáticas en tu dashboard médico.
          </p>
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <Link2 size={18} />
            Conectar con Withings
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 mt-3 text-center">
        Serás redirigido a Withings para autorizar el acceso seguro.
      </p>
    </div>
  );
}
