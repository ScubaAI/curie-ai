'use client';

import { useState } from 'react';
import { Activity, Heart, Wifi, Battery, ChevronRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface ProductSpecs {
  weight: string;
  battery: string;
  connectivity: string;
  display: string;
}

interface WithingsProductProps {
  clipPaymentUrl: string; // Tu link de pago de Clip
  affiliateWithingsUrl?: string; // Opcional: link con comisión
}

export default function WithingsProductCard({ 
  clipPaymentUrl,
  affiliateWithingsUrl = "https://www.withings.com/body-scan" 
}: WithingsProductProps) {
  const [showDetails, setShowDetails] = useState(false);

  const features = [
    { icon: Heart, label: "ECG 6 derivaciones", desc: "Detección clínica de FA" },
    { icon: Activity, label: "BIA Multifrecuencia", desc: "Análisis segmental corporal" },
    { icon: Wifi, label: "WiFi + Bluetooth", desc: "Autosync automático" },
    { icon: Battery, label: "1 año batería", desc: "Recargable USB-C" }
  ];

  const specs: ProductSpecs = {
    weight: "5-200 kg precisión",
    battery: "Hasta 12 meses",
    connectivity: "WiFi 802.11 b/g/n + BT",
    display: "LCD 2.8\" a color"
  };

  return (
    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/30 rounded-3xl p-8 lg:p-10 relative overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* Badge de integración nativa */}
      <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
          Integración Curie ✓
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 flex items-center justify-center shadow-xl">
          {/* Placeholder para imagen del producto */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center mb-1">
              <Activity size={24} className="text-emerald-400" />
            </div>
            <span className="text-[10px] text-slate-500">Body Scan</span>
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-2xl font-light text-white mb-2">
            Withings Body Scan
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            Báscula inteligente con ECG clínico de 6 derivaciones y análisis segmental de composición corporal. 
            Compatible nativamente con tu dashboard Curie.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-light text-emerald-400">$5,499 MXN</span>
            <span className="text-sm text-slate-500 line-through">$6,299</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">
              Envío gratis
            </span>
          </div>
        </div>
      </div>

      {/* Features grid rápido */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {features.map((feature, idx) => (
          <div key={idx} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3 text-center hover:border-emerald-500/30 transition-colors">
            <feature.icon size={20} className="mx-auto text-emerald-400 mb-2" />
            <div className="text-xs font-medium text-slate-200">{feature.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{feature.desc}</div>
          </div>
        ))}
      </div>

      {/* Toggle detalles técnicos */}
      <button 
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between py-3 px-4 bg-slate-900/30 rounded-xl border border-slate-700/30 hover:bg-slate-900/50 transition-all mb-6 text-sm text-slate-300"
      >
        <span>Especificaciones técnicas</span>
        <ChevronRight 
          size={16} 
          className={`text-slate-500 transition-transform ${showDetails ? 'rotate-90' : ''}`} 
        />
      </button>

      {showDetails && (
        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 animate-in slide-in-from-top-2">
          {Object.entries(specs).map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{key}</span>
              <span className="text-sm text-slate-300">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="space-y-3">
        <a
          href={clipPaymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-black font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.4)] uppercase tracking-wider text-sm"
        >
          <span>Comprar ahora</span>
          <span className="text-xs opacity-70">via Clip</span>
        </a>

        <div className="flex gap-3">
          <a
            href={affiliateWithingsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-3 px-4 bg-slate-900/50 border border-slate-700/30 rounded-xl text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-all text-center"
          >
            Ver en Withings.com
          </a>
          
          <button className="flex-1 py-3 px-4 bg-slate-900/50 border border-slate-700/30 rounded-xl text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-all">
            Comparar modelos
          </button>
        </div>
      </div>

      {/* Trust badges */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-700/30">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Truck size={14} className="text-emerald-500" />
          Envío 24-48h
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={14} className="text-emerald-500" />
          Garantía 2 años
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw size={14} className="text-emerald-500" />
          Devolución 30 días
        </div>
      </div>

      {/* Nota de integración */}
      <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 animate-pulse" />
          <div>
            <p className="text-sm text-emerald-200/80 font-medium">
              Integración automática con Curie
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Tus datos de Body Scan aparecerán automáticamente en tu dashboard médico. 
              Compatibilidad certificada con Withings API.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
