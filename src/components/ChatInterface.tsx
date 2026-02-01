'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Cpu, 
  User, 
  Activity, 
  Sparkles, 
  Scale, 
  ShieldCheck, 
  Zap 
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TelemetryData {
  bpm: number;
  weight: number;
  status: string;
}

export default function ChatInterface({ 
  isEmergency = false 
}: { 
  isEmergency?: boolean 
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hola Abraham, soy Curie. He analizado tu perfil actual de 71 kg. ¿Deseas revisar los ajustes de tu dieta para alcanzar los 75 kg o tienes alguna duda sobre tu suplementación?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Telemetría simulada basada en el perfil de Abraham
  const [telemetry] = useState<TelemetryData>({
    bpm: 72,
    weight: 71.0,
    status: 'Análisis Predictivo Activo'
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulación de respuesta de Helena (Integración con Groq pendiente)
    setTimeout(() => {
      setIsTyping(false);
      const helenaMsg: Message = {
        role: 'assistant',
        content: 'Entendido. Estoy procesando los ajustes fisiológicos. Recuerda que para subir a 75 kg con bajos carbohidratos, priorizaremos la densidad calórica del aceite de oliva y coco.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, helenaMsg]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen max-h-[900px] bg-slate-950/50 backdrop-blur-2xl border border-cyan-500/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] relative mx-auto max-w-2xl">
      
      {/* HEADER CON TELEMETRÍA ACTIVA */}
      <div className="bg-slate-900/40 border-b border-cyan-500/10 p-6 flex justify-between items-center backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-full border border-cyan-500/20 animate-pulse">
            <Cpu size={18} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-widest uppercase italic font-sans">Helena Intelligence</h3>
            <p className="text-[10px] text-cyan-400/70 font-mono uppercase tracking-wider">
              {isEmergency ? '⚠ Protocolo de Emergencia' : `Online • ${telemetry.status}`}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <TelemetryChip icon={<Activity size={12} />} value={telemetry.bpm} unit="BPM" color="rose" />
          <TelemetryChip icon={<Scale size={12} />} value={telemetry.weight} unit="kg" color="emerald" />
        </div>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Sparkles size={14} className="text-cyan-400" />
                </div>
              )}
              
              <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl backdrop-blur-xl border ${
                m.role === 'user' 
                  ? 'bg-slate-800/60 border-slate-700/50 text-slate-200 rounded-br-md' 
                  : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-50 rounded-bl-md shadow-[0_0_20px_rgba(6,182,212,0.05)]'
              }`}>
                <p className={`text-sm leading-relaxed ${m.role === 'assistant' ? 'font-light' : 'font-normal'}`}>
                  {m.content}
                </p>
                <span className="text-[10px] opacity-40 mt-2 block font-mono">
                  {m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-slate-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-cyan-500/50"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center">
              <Zap size={14} className="animate-pulse text-cyan-400" />
            </div>
            <div className="flex gap-1 bg-slate-900/50 px-4 py-3 rounded-2xl rounded-bl-md border border-cyan-500/10">
              {[0, 0.4, 0.8].map((delay) => (
                <motion.span 
                  key={delay}
                  animate={{ opacity: [0.2, 1, 0.2] }} 
                  transition={{ repeat: Infinity, duration: 1.2, delay }} 
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full" 
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <div className="p-6 bg-slate-900/40 border-t border-cyan-500/10 backdrop-blur-xl">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl blur-xl group-focus-within:bg-cyan-500/10 transition-all duration-500" />
          <div className="relative flex items-center gap-3 bg-black/40 border border-slate-700/50 group-focus-within:border-cyan-500/30 rounded-2xl px-5 py-4 transition-all">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta nutricional..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none font-light"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all disabled:opacity-30"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
        
        <div className="flex justify-center items-center gap-4 mt-4">
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em] flex items-center gap-1">
            <ShieldCheck size={10} /> E2EE Activado
          </p>
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em]">
            Visionary AI Labs • 2026
          </p>
        </div>
      </div>
    </div>
  );
}

function TelemetryChip({ icon, value, unit, color }: { icon: any, value: number, unit: string, color: 'rose' | 'emerald' | 'cyan' }) {
  const colorClasses = {
    rose: 'text-rose-400 border-rose-500/20 bg-rose-950/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-950/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
  };
  
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold font-mono uppercase tracking-wider ${colorClasses[color]}`}>
      {icon}
      <span>{value} {unit}</span>
    </div>
  );
}