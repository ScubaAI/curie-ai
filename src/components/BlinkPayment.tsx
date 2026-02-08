'use client';

import { QRCodeSVG } from 'qrcode.react'; 
import { Zap, ShieldCheck, ExternalLink, Copy, Bitcoin, Check } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export default function BlinkPayment() {
  const lnAddress = "curie@blink.sv";
  const [copied, setCopied] = useState(false);
  const [weeklySats, setWeeklySats] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [qrSize, setQrSize] = useState(200);
  const serverGoal = 5000000;

  // Detectar mobile UNA VEZ (no en cada render)
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    // QR responsive
    const handleResize = () => {
      setQrSize(window.innerWidth < 640 ? 160 : 200);
    };
    handleResize(); // Ejecutar inmediatamente
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(lnAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard failed', err);
    }
  };

  // SIMPLIFICADO: Solo una llamada inicial, sin polling agresivo
  // La API ya tiene caché de 60s, el frontend no necesita más
  useEffect(() => {
    let mounted = true;
    
    async function syncBlink() {
      try {
        const res = await fetch('/api/blink/stats');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted) setWeeklySats(data.balance);
      } catch (e) {
        console.error("Blink sync failed:", e);
      }
    }

    syncBlink(); // Carga inicial
    
    // Polling suave: cada 5 minutos (no cada 60 segundos)
    // La API ya cachea 60s, esto es solo para UI fresca
    const interval = setInterval(syncBlink, 5 * 60 * 1000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []); // ← Array vacío = solo al montar

  const qrValue = `lightning:${lnAddress}`;
  const paymentHref = isMobile ? `lightning:${lnAddress}` : `https://blink.sv/${lnAddress}`;

  return (
    <section className="bg-gradient-to-br from-slate-950 via-black to-slate-950 border border-cyan-500/10 rounded-3xl p-8 lg:p-10 relative overflow-hidden group backdrop-blur-xl shadow-2xl">
      {/* Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-600/8 blur-[120px] rounded-full group-hover:bg-cyan-600/15 transition-all duration-1000" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/5 blur-[100px] rounded-full group-hover:bg-orange-600/12 transition-all duration-1000" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3.5 bg-gradient-to-br from-cyan-900/40 to-orange-900/20 rounded-2xl border border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <Bitcoin size={24} className="text-cyan-300" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
              Soberanía Médica Abierta
            </h3>
            <p className="text-xs text-slate-400 font-mono tracking-wider mt-1">
              Financiada por Sats
            </p>
          </div>
        </div>

        {/* QR Code - ahora con tamaño controlado por estado */}
        <div className="relative mb-10 p-8 bg-gradient-to-br from-slate-900 to-black rounded-3xl border border-cyan-500/15 shadow-[0_0_50px_rgba(6,182,212,0.12),inset_0_0_20px_rgba(255,165,0,0.04)]">
          <QRCodeSVG 
            value={qrValue} 
            size={qrSize}
            level="H"
            fgColor="#00f0ff"
            bgColor="transparent"
            includeMargin={false}
          />
          <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-cyan-500/10 via-transparent to-orange-500/10 pointer-events-none" />
        </div>

        {/* Texto */}
        <div className="max-w-md space-y-6 mb-10">
          <p className="text-lg font-light text-slate-200 leading-relaxed">
            Curie es open source total: chat libre, conocimiento médico sin barreras para todos.
          </p>
          <p className="text-base italic text-orange-300/90 font-medium">
            Pero las APIs de élite y servidores cuestan sats reales. Tus sats financian la medicina descentralizada y abierta.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm mb-8 space-y-3">
          <div className="flex justify-between text-xs text-slate-400 uppercase tracking-wider font-medium">
            <span>Sats esta semana</span>
            <span className="text-orange-300">{weeklySats.toLocaleString()} / {serverGoal.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-slate-800/50 rounded-full border border-cyan-500/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all duration-1000"
              style={{ width: `${Math.min(100, (weeklySats / serverGoal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="w-full max-w-sm space-y-5">
          <button 
            onClick={copyToClipboard}
            className="w-full flex items-center justify-between py-4 px-6 bg-black/60 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-black/80 transition-all group shadow-inner"
          >
            <span className="text-sm font-mono text-cyan-200 tracking-tight">{lnAddress}</span>
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-cyan-500/70 group-hover:text-cyan-300 transition-colors" />}
          </button>

          <a 
            href={paymentHref}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-cyan-600/80 to-orange-600/80 hover:from-cyan-500 hover:to-orange-500 text-black font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] uppercase tracking-wider text-sm"
          >
            <Zap size={18} className="fill-black/30" />
            Enviar Sats
          </a>

          <div className="flex items-center justify-between pt-6 text-xs text-slate-500 uppercase tracking-widest font-medium border-t border-cyan-500/10">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              Instantáneo · Soberano
            </div>
            <a 
              href="https://www.blink.sv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
            >
              Powered by Blink <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}