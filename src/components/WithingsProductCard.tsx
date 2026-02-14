'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Wifi, Battery, ChevronRight, ShieldCheck, Truck, RefreshCw, Zap } from 'lucide-react';

interface WithingsProductProps {
  clipPaymentUrl: string;
  affiliateWithingsUrl?: string;
  productImage?: string; // Opcional: URL de imagen real del producto
}

export default function WithingsProductCard({
  clipPaymentUrl,
  affiliateWithingsUrl = "https://www.withings.com/mx/body-scan",
  productImage = "/images/withings-body-scan-hero.png" // fallback o placeholder
}: WithingsProductProps) {
  const [showDetails, setShowDetails] = useState(false);

  const features = [
    { icon: Heart, label: "ECG 6 derivaciones", desc: "Detección clínica de fibrilación auricular" },
    { icon: Activity, label: "BIA multifrecuencia", desc: "Análisis segmental preciso" },
    { icon: Wifi, label: "WiFi + Bluetooth", desc: "Sincronización automática" },
    { icon: Battery, label: "Batería 12 meses", desc: "Recargable USB-C" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-slate-950 via-slate-900/95 to-slate-950 border border-slate-700/40 rounded-3xl p-8 lg:p-10 relative overflow-hidden backdrop-blur-xl shadow-2xl shadow-cyan-950/30 hover:shadow-cyan-950/50 transition-shadow duration-500"
    >
      {/* Badge exclusivo Curie */}
      <div className="absolute top-5 right-5 z-10">
        <div className="bg-gradient-to-r from-emerald-600/80 to-teal-600/80 px-4 py-1.5 rounded-full border border-emerald-400/30 shadow-lg shadow-emerald-950/40">
          <span className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
            <Zap size={12} className="text-white" />
            Exclusivo Curie
          </span>
        </div>
      </div>

      {/* Hero con imagen real + overlay glow */}
      <div className="relative mb-10 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
        <img
          src={productImage}
          alt="Withings Body Scan"
          className="w-full h-64 lg:h-80 object-cover object-center transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = '/images/withings-placeholder.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Título y descripción */}
      <h3 className="text-3xl font-light text-white mb-3 tracking-tight">
        Withings Body Scan
      </h3>
      <p className="text-slate-300 leading-relaxed mb-6">
        La báscula clínica más avanzada del mundo: ECG médico, análisis vascular y composición corporal segmental — sincronizada directamente con tu perfil Curie.
      </p>

      {/* Precio – impacto visual */}
      <div className="flex items-baseline gap-4 mb-8">
        <span className="text-5xl font-light text-emerald-400 tracking-tight">$5,499</span>
        <span className="text-2xl text-slate-500 line-through">$6,299</span>
        <span className="text-lg font-medium text-emerald-500 bg-emerald-950/40 px-4 py-1 rounded-full border border-emerald-800/30">
          Envío gratis • Ahorras $800
        </span>
      </div>

      {/* Features – más espaciadas y elegantes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {features.map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, borderColor: 'rgba(16,185,129,0.4)' }}
            className="bg-slate-900/40 border border-slate-700/40 rounded-2xl p-4 text-center transition-all duration-300"
          >
            <f.icon size={28} className="mx-auto text-emerald-400 mb-3" />
            <div className="text-sm font-medium text-white">{f.label}</div>
            <div className="text-xs text-slate-400 mt-1">{f.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Toggle specs */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between py-4 px-6 bg-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/40 transition-all mb-8"
      >
        <span className="text-slate-200 font-medium">Ver especificaciones técnicas</span>
        <ChevronRight
          size={20}
          className={`text-slate-400 transition-transform ${showDetails ? 'rotate-90' : ''}`}
        />
      </button>

      {showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 p-6 bg-slate-950/60 rounded-2xl border border-slate-800/50">
          <div>
            <span className="text-xs uppercase text-slate-500">Peso soportado</span>
            <p className="text-slate-200 font-medium">5 – 200 kg (±50 g)</p>
          </div>
          <div>
            <span className="text-xs uppercase text-slate-500">Batería</span>
            <p className="text-slate-200 font-medium">Hasta 12 meses</p>
          </div>
          <div>
            <span className="text-xs uppercase text-slate-500">Conectividad</span>
            <p className="text-slate-200 font-medium">WiFi + Bluetooth</p>
          </div>
          <div>
            <span className="text-xs uppercase text-slate-500">Pantalla</span>
            <p className="text-slate-200 font-medium">Color 2.8" LCD</p>
          </div>
        </div>
      )}

      {/* CTA principal – pulso sutil */}
      <motion.a
        href={clipPaymentUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="block w-full py-6 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl shadow-emerald-900/50 hover:shadow-emerald-700/70 flex items-center justify-center gap-3 relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-3">
          Comprar ahora por $5,499 MXN
          <Truck size={20} />
        </span>
        <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
      </motion.a>

      {/* Opciones secundarias */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <a
          href={affiliateWithingsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-4 px-6 bg-slate-900/60 border border-slate-700 rounded-2xl text-center text-slate-300 hover:text-white hover:border-slate-500 transition-all"
        >
          Ver en Withings
        </a>
        <button className="py-4 px-6 bg-slate-900/60 border border-slate-700 rounded-2xl text-center text-slate-300 hover:text-white hover:border-slate-500 transition-all">
          Comparar modelos
        </button>
      </div>

      {/* Trust line – minimal y elegante */}
      <div className="flex justify-center gap-8 mt-10 pt-8 border-t border-slate-800/50 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Truck size={16} className="text-emerald-500" />
          Envío 24-48 h
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          Garantía 2 años
        </div>
        <div className="flex items-center gap-2">
          <RefreshCw size={16} className="text-emerald-500" />
          30 días devolución
        </div>
      </div>

      {/* Integración nota – pulso vivo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-5 bg-emerald-950/30 border border-emerald-800/30 rounded-2xl flex items-start gap-4"
      >
        <div className="relative mt-1">
          <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping" />
        </div>
        <div>
          <p className="text-emerald-300 font-medium">Integración nativa con Curie</p>
          <p className="text-slate-400 text-sm mt-1">
            Tus datos aparecerán en tiempo real en tu dashboard. Sin apps extras. Certificado por Withings API.
          </p>
        </div>
      </motion.div>
    </motion.section>
  );
}