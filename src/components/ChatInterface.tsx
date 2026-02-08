'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, Activity, Scale, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  telemetry: any; // Datos en tiempo real (Antena)
  patientData: any; // Datos históricos (Prisma/Nexus)
  isEmergency?: boolean;
}

export default function ChatInterface({ telemetry, patientData, isEmergency }: ChatInterfaceProps) {
  // 1. Mejoramos el mensaje de bienvenida para que use datos históricos
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (patientData && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Enlace establecido. Abraham, veo que tu SMM está en ${patientData.compositions?.[0]?.smm || '...'}kg. Detecto un pulso de ${telemetry.bpm} BPM. ¿Analizamos el impacto del último protocolo?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [patientData]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          // ENVIAMOS AMBOS: El presente (telemetry) y el pasado (patientData)
          telemetry,
          patientData 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Neural Link Timeout');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }]);

    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `ERROR_SISTEMA: ${error.message}. Reiniciando interfaz...`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-black/40 backdrop-blur-3xl border ${isEmergency ? 'border-rose-500/50' : 'border-white/5'} rounded-t-[2.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl`}>
      
      {/* HEADER: Dinámico con alertas de emergencia */}
      <div className={`${isEmergency ? 'bg-rose-950/80' : 'bg-slate-900/80'} border-b border-white/5 p-6 flex justify-between items-center transition-colors`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu size={20} className={isEmergency ? 'text-rose-400' : 'text-cyan-400'} />
            <motion.span 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute -top-1 -right-1 w-2 h-2 ${isEmergency ? 'bg-rose-500' : 'bg-cyan-500'} rounded-full`} 
            />
          </div>
          <div>
            <h3 className="text-white font-bold text-xs tracking-widest uppercase">Curie v1.0</h3>
            <p className="text-[10px] text-slate-500 font-mono italic">
              {isEmergency ? 'EMERGENCY_OVERRIDE_ACTIVE' : 'SENTIENT_NEURAL_LINK'}
            </p>
          </div>
        </div>
        
        {/* Bio-Monitores rápidos en el chat */}
        <div className="flex gap-4 items-center">
           <div className="flex flex-col items-end">
             <span className="text-[8px] text-slate-500 uppercase font-black">BPM</span>
             <span className="text-rose-500 font-mono text-sm leading-none">{telemetry.bpm}</span>
           </div>
           <div className="flex flex-col items-end">
             <span className="text-[8px] text-slate-500 uppercase font-black">Depth</span>
             <span className="text-cyan-400 font-mono text-sm leading-none">
                {patientData?.metrics?.find((m: any) => m.type === 'DEPTH')?.value || 0}m
             </span>
           </div>
        </div>
      </div>

      {/* CHAT LOG */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-gradient-to-b from-transparent to-cyan-950/5">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`relative max-w-[85%] p-4 rounded-2xl ${
                m.role === 'user' 
                  ? 'bg-cyan-600/10 border border-cyan-500/20 text-cyan-50' 
                  : 'bg-slate-900/40 border border-white/5 text-slate-200'
              }`}>
                <p className="text-sm leading-relaxed font-light tracking-wide">
                  {m.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <div className="flex items-center gap-2 text-cyan-500/50 text-[10px] font-mono animate-pulse">
            <Sparkles size={12} /> Consultando Nexus Core...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <div className="p-6 bg-slate-900/90 border-t border-white/5">
        <div className="flex items-center gap-3">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={isEmergency ? "Protocolo de emergencia..." : "Hablar con Curie..."}
            className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none transition-all"
          />
          <button 
            onClick={sendMessage}
            className="p-3 bg-cyan-600 rounded-xl text-black hover:bg-cyan-500 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}