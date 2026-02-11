// BlinkPayment.tsx - versión producción médica
'use client';

import { QRCodeSVG } from 'qrcode.react'; 
import { Zap, ShieldCheck, ExternalLink, Copy, Bitcoin, Check, RefreshCw, HeartPulse } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BlinkPayment() {
  const lnAddress = "curie@blink.sv";
  const [copied, setCopied] = useState(false);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeklySats, setWeeklySats] = useState(0);
  const serverGoal = 5000000;

  useEffect(() => {
    async function generateInvoice() {
      try {
        const res = await fetch('/api/blink/invoice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            amountSats: 21000,
            memo: 'Donación a Curie Intelligence - Plataforma de salud'
          }),
        });
        
        const data = await res.json();
        if (data.invoice) setInvoice(data.invoice);
      } catch (e) {
        console.error("Invoice generation failed:", e);
      } finally {
        setLoading(false);
      }
    }

    generateInvoice();
    
    async function syncBlink() {
      try {
        const res = await fetch('/api/blink/stats');
        const data = await res.json();
        setWeeklySats(data.balance);
      } catch (e) {
        console.error("Blink sync failed:", e);
      }
    }
    syncBlink();
  }, []);

  const copyToClipboard = async () => {
    const textToCopy = invoice || lnAddress;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard failed', err);
    }
  };

  const regenerateInvoice = () => {
    setLoading(true);
    window.location.reload();
  };

  return (
    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-700/30 rounded-3xl p-8 lg:p-10 relative overflow-hidden group backdrop-blur-xl shadow-2xl">
      {/* Glows sutiles */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-600/5 blur-[120px] rounded-full group-hover:bg-emerald-600/10 transition-all duration-1000" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-600/5 blur-[100px] rounded-full group-hover:bg-amber-600/10 transition-all duration-1000" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Header - Lenguaje médico neutral */}
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3.5 bg-gradient-to-br from-emerald-900/40 to-teal-900/20 rounded-2xl border border-emerald-500/20 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
            <HeartPulse size={24} className="text-emerald-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-emerald-400">
              Apoya la Salud Digital
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Financiación transparente
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="relative mb-10 p-8 bg-gradient-to-br from-slate-900 to-black rounded-3xl border border-slate-700/30 shadow-[0_0_50px_rgba(16,185,129,0.08)]">
          {loading ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : invoice ? (
            <QRCodeSVG 
              value={invoice}
              size={200}
              level="H"
              fgColor="#10b981"
              bgColor="transparent"
              includeMargin={false}
            />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-500 text-sm">
              Error al generar invoice
            </div>
          )}
          
          {!loading && invoice && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              21,000 sats
            </div>
          )}
        </div>

        {/* Texto - Sin referencias políticas */}
        <div className="max-w-md space-y-6 mb-10">
          <p className="text-lg font-light text-slate-200 leading-relaxed">
            Curie es una plataforma de salud open source. Tu apoyo mantiene los servidores y las consultas accesibles.
          </p>
          <p className="text-base italic text-emerald-300/80 font-medium">
            Las donaciones financian infraestructura médica digital segura y accesible para todos.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-sm mb-8 space-y-3">
          <div className="flex justify-between text-xs text-slate-400 uppercase tracking-wider font-medium">
            <span>Financiación semanal</span>
            <span className="text-emerald-400">{weeklySats.toLocaleString()} / {serverGoal.toLocaleString()}</span>
          </div>
          <div className="h-2 bg-slate-800/50 rounded-full border border-slate-700/30 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-1000"
              style={{ width: `${Math.min(100, (weeklySats / serverGoal) * 100)}%` }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="w-full max-w-sm space-y-5">
          <button 
            onClick={copyToClipboard}
            disabled={!invoice}
            className="w-full flex items-center justify-between py-4 px-6 bg-black/60 rounded-2xl border border-slate-700/30 hover:border-emerald-500/40 hover:bg-black/80 transition-all group shadow-inner disabled:opacity-50"
          >
            <span className="text-sm font-mono text-emerald-200/80 tracking-tight truncate max-w-[200px]">
              {invoice ? `${invoice.substring(0, 20)}...` : 'Generando...'}
            </span>
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />}
          </button>

          <div className="flex gap-3">
            <a 
              href={`lightning:${invoice || lnAddress}`}
              className="flex-1 flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-500 hover:to-teal-500 text-black font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.4)] uppercase tracking-wider text-sm disabled:opacity-50"
            >
              <Zap size={18} className="fill-black/30" />
              Abrir Wallet
            </a>
            
            <button
              onClick={regenerateInvoice}
              className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/30 hover:bg-slate-700/50 transition-colors"
              title="Generar nuevo invoice"
            >
              <RefreshCw size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-6 text-xs text-slate-500 uppercase tracking-widest font-medium border-t border-slate-700/20">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              Pago seguro · Sin intermediarios
            </div>
            <a 
              href="https://www.blink.sv" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              Powered by Blink <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}