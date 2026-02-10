'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Cpu, 
  Activity, 
  Scale, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

// Shared types for consistency
import { CompositionData, DiveMetric, BiometricData, PatientData, TelemetryData, ChatEvent } from '@/types/shared';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    eventsDetected?: number;
    criticalEvents?: number;
    dataConflicts?: number;
  };
}

interface ChatInterfaceProps {
  telemetry: TelemetryData;
  patientData: PatientData | null;
  isEmergency?: boolean;
  newEvents?: ChatEvent[];
}

// Hook personalizado para debounce de telemetry
function useDebouncedTelemetry(telemetry: TelemetryData, delay: number = 1000) {
  const [debounced, setDebounced] = useState(telemetry);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(telemetry), delay);
    return () => clearTimeout(timer);
  }, [telemetry, delay]);
  
  return debounced;
}

export default function ChatInterface({ 
  telemetry, 
  patientData, 
  isEmergency = false,
  newEvents = []
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [showEventBanner, setShowEventBanner] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedTelemetry = useDebouncedTelemetry(telemetry);

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Enfocar input al cargar
  useEffect(() => {
    if (!isTyping && connectionStatus === 'connected') {
      inputRef.current?.focus();
    }
  }, [isTyping, connectionStatus]);

  // Detectar conexión establecida
  useEffect(() => {
    if (patientData && connectionStatus === 'connecting') {
      setConnectionStatus('connected');
    }
  }, [patientData, connectionStatus]);

  // Enviar mensaje inicial SOLO cuando tenemos datos completos
  useEffect(() => {
    if (patientData && messages.length === 0) {
      // No mostramos mensaje de bienvenida aquí - lo maneja el backend con el saludo contextual
      sendInitialMessage();
    }
  }, [patientData?.id]); // Solo cuando cambia el paciente, no en cada render

  const sendInitialMessage = useCallback(async () => {
    setIsTyping(true);
    setConnectionStatus('connecting');
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [], // Array vacío = primera interacción
          telemetry: debouncedTelemetry,
          patientData 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Neural Link Timeout');

      setMessages([{
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        metadata: data.metadata
      }]);
      
      setConnectionStatus('connected');
      
    } catch (error: any) {
      setConnectionStatus('error');
      setMessages([{
        role: 'assistant',
        content: `**[ERROR DE CONEXIÓN]**\n\nNo se pudo establecer enlace con CURIE Neural Core.\n\n${error.message}\n\nIntenta recargar la página.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [debouncedTelemetry, patientData]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping || connectionStatus === 'error') return;

    const userMsg: ChatMessage = { 
      role: 'user', 
      content: input.trim(), 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ 
            role: m.role, 
            content: m.content 
          })),
          telemetry: debouncedTelemetry,
          patientData 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Neural Link Timeout');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        metadata: data.metadata
      }]);

    } catch (error: any) {
      setConnectionStatus('error');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `**[MODO DEGRADADO]** ⚠️\n\nError de comunicación: ${error.message}\n\nÚltimos datos locales aún disponibles, pero no puedo consultar el núcleo de análisis.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Formatear timestamp relativo
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes}m`;
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Obtener último mensaje del asistente para mostrar metadata
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
  const hasCriticalEvents = lastAssistantMessage?.metadata?.criticalEvents && lastAssistantMessage.metadata.criticalEvents > 0;
  const hasDataConflicts = lastAssistantMessage?.metadata?.dataConflicts && lastAssistantMessage.metadata.dataConflicts > 0;

  return (
    <div className={`
      flex flex-col h-full bg-black/40 backdrop-blur-3xl 
      ${isEmergency ? 'border-2 border-rose-500/50 shadow-rose-500/20' : 'border border-white/5'} 
      rounded-t-[2.5rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-300
    `}>
      
      {/* HEADER: Estado del sistema y métricas vitales */}
      <div className={`
        ${isEmergency ? 'bg-rose-950/90' : 'bg-slate-900/90'} 
        border-b border-white/5 p-4 lg:p-6 flex justify-between items-center transition-colors
      `}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu size={20} className={isEmergency ? 'text-rose-400' : 'text-cyan-400'} />
            <motion.span 
              animate={{ 
                opacity: connectionStatus === 'connected' ? [0.3, 1, 0.3] : 1,
                scale: connectionStatus === 'error' ? [1, 1.2, 1] : 1
              }}
              transition={{ duration: connectionStatus === 'error' ? 0.5 : 2, repeat: Infinity }}
              className={`
                absolute -top-1 -right-1 w-2 h-2 rounded-full
                ${connectionStatus === 'connected' ? (isEmergency ? 'bg-rose-500' : 'bg-cyan-500') : ''}
                ${connectionStatus === 'connecting' ? 'bg-amber-500' : ''}
                ${connectionStatus === 'error' ? 'bg-red-600' : ''}
              `} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-xs tracking-widest uppercase">CURIE v2.2</h3>
              {connectionStatus === 'error' && (
                <WifiOff size={12} className="text-red-500" />
              )}
            </div>
            <p className="text-[10px] font-mono uppercase tracking-wider">
              {isEmergency ? (
                <span className="text-rose-400 font-black animate-pulse">PROTOCOLO EMERGENCIA</span>
              ) : connectionStatus === 'connected' ? (
                <span className="text-cyan-500/80">NEURAL LINK STABLE</span>
              ) : connectionStatus === 'connecting' ? (
                <span className="text-amber-500/80">SYNCING...</span>
              ) : (
                <span className="text-red-500/80">CONNECTION LOST</span>
              )}
            </p>
          </div>
        </div>
        
        {/* Bio-Monitores con indicadores de tendencia */}
        <div className="flex gap-4 lg:gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
              <Activity size={8} /> BPM
            </span>
            <div className="flex items-center gap-1">
              <span className={`
                font-mono text-sm leading-none font-bold
                ${telemetry.bpm > 100 ? 'text-rose-500' : telemetry.bpm < 50 ? 'text-amber-500' : 'text-emerald-400'}
              `}>
                {telemetry.bpm}
              </span>
              {telemetry.bpm > 80 && (
                <TrendingUp size={10} className="text-rose-500" />
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
              <Scale size={8} /> PESO
            </span>
            <span className="text-cyan-400 font-mono text-sm leading-none font-bold">
              {telemetry.weight}<span className="text-[8px] text-slate-500 ml-0.5">kg</span>
            </span>
          </div>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1">
              <Activity size={8} /> SMM
            </span>
            <span className="text-emerald-400 font-mono text-sm leading-none font-bold">
              {telemetry.muscleMass}<span className="text-[8px] text-slate-500 ml-0.5">kg</span>
            </span>
          </div>
        </div>
      </div>

      {/* BANNER DE EVENTOS: Muestra eventos nuevos detectados */}
      {newEvents.length > 0 && showEventBanner && (
        <AnimatePresence>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`
              border-b border-white/5 px-4 py-3 flex items-center justify-between
              ${newEvents.some(e => e.severity === 'CRITICAL') ? 'bg-red-950/50' : 'bg-amber-950/30'}
            `}
          >
            <div className="flex items-center gap-3">
              {newEvents.some(e => e.severity === 'CRITICAL') ? (
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {newEvents.length} Evento{newEvents.length > 1 ? 's' : ''} Detectado
                </span>
                <span className="text-xs text-slate-300">
                  {newEvents[0].title}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setShowEventBanner(false)}
              className="text-[10px] text-slate-500 hover:text-white uppercase tracking-wider"
            >
              Ocultar
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* INDICADOR DE CONFLICTOS DE DATOS */}
      {hasDataConflicts && (
        <div className="bg-amber-950/30 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2">
          <AlertCircle size={12} className="text-amber-500" />
          <span className="text-[10px] text-amber-400 uppercase tracking-wider">
            Conflicto de fuentes de datos detectado
          </span>
        </div>
      )}

      {/* CHAT LOG */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scrollbar-hide bg-gradient-to-b from-transparent to-cyan-950/5">
        <AnimatePresence mode="popLayout">
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              layout
              initial={{ opacity: 0, y: m.role === 'user' ? 10 : -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                relative max-w-[90%] lg:max-w-[80%] p-4 rounded-2xl
                ${m.role === 'user' 
                  ? 'bg-cyan-600/10 border border-cyan-500/20 text-cyan-50' 
                  : m.content.includes('**[ERROR') || m.content.includes('**[MODO DEGRADADO')
                    ? 'bg-red-950/30 border border-red-500/20 text-red-100'
                    : m.content.includes('🚨') || m.content.includes('ALERTA')
                      ? 'bg-rose-950/30 border border-rose-500/20 text-rose-100'
                      : 'bg-slate-900/60 border border-white/5 text-slate-200'
                }
              `}>
                {/* Metadata del mensaje si existe */}
                {m.metadata && m.metadata.criticalEvents && m.metadata.criticalEvents > 0 && (
                  <div className="flex items-center gap-1 mb-2 pb-2 border-b border-white/10">
                    <AlertTriangle size={10} className="text-red-500" />
                    <span className="text-[9px] text-red-400 uppercase tracking-wider font-bold">
                      {m.metadata.criticalEvents} Alerta{m.metadata.criticalEvents > 1 ? 's' : ''} Crítica
                    </span>
                  </div>
                )}
                
                {/* Contenido con formato preservado */}
                <div className="text-sm leading-relaxed font-light tracking-wide whitespace-pre-wrap">
                  {m.content}
                </div>

                {/* Timestamp */}
                <div className={`
                  mt-2 text-[9px] uppercase tracking-wider flex items-center gap-1
                  ${m.role === 'user' ? 'text-cyan-500/50 justify-end' : 'text-slate-600'}
                `}>
                  <Clock size={8} />
                  {formatTime(m.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Indicador de escritura */}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 text-cyan-500/60 text-[10px] font-mono"
          >
            <div className="flex gap-1">
              <motion.span 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
              />
              <motion.span 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
              />
              <motion.span 
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-cyan-500 rounded-full"
              />
            </div>
            <span>Procesando contexto neural...</span>
          </motion.div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 lg:p-6 bg-slate-900/90 border-t border-white/5">
        {/* Sugerencias rápidas cuando no hay input */}
        {input.length === 0 && messages.length > 0 && !isTyping && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
            {['¿Cómo va mi progreso?', 'Analizar última inmersión', 'Conflicto de datos', 'Protocolo activo'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <input 
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEmergency 
              ? "Describe tus síntomas..." 
              : connectionStatus === 'error'
                ? "Reconexión necesaria..."
                : "Consultar datos o reportar contexto..."
            }
            disabled={isTyping || connectionStatus === 'error'}
            className={`
              flex-1 bg-black border rounded-xl px-4 py-3 text-sm outline-none transition-all
              ${isEmergency 
                ? 'border-rose-500/30 focus:border-rose-500/60 placeholder:text-rose-500/30' 
                : 'border-white/10 focus:border-cyan-500/50 placeholder:text-slate-600'
              }
              ${(isTyping || connectionStatus === 'error') ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          />
          <button 
            onClick={sendMessage}
            disabled={!input.trim() || isTyping || connectionStatus === 'error'}
            className={`
              p-3 rounded-xl transition-all duration-200
              ${isEmergency 
                ? 'bg-rose-600 hover:bg-rose-500 text-white disabled:bg-rose-900/30' 
                : 'bg-cyan-600 hover:bg-cyan-500 text-black disabled:bg-slate-800 disabled:text-slate-600'
              }
              ${(!input.trim() || isTyping) ? 'scale-95' : 'hover:scale-105'}
            `}
          >
            <Send size={18} className={isTyping ? 'animate-pulse' : ''} />
          </button>
        </div>
        
        {/* Footer con estado */}
        <div className="flex justify-between items-center mt-3 text-[9px] text-slate-600 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <>
                <CheckCircle2 size={10} className="text-emerald-500" />
                <span>Contexto Persistente</span>
              </>
            ) : connectionStatus === 'error' ? (
              <>
                <WifiOff size={10} className="text-red-500" />
                <span className="text-red-500">Sin conexión</span>
              </>
            ) : (
              <>
                <Sparkles size={10} className="text-amber-500 animate-pulse" />
                <span>Sincronizando...</span>
              </>
            )}
          </div>
          <div className="hidden sm:block">
            {lastAssistantMessage?.metadata?.eventsDetected 
              ? `${lastAssistantMessage.metadata.eventsDetected} eventos procesados`
              : 'Sistema listo'
            }
          </div>
        </div>
      </div>
    </div>
  );
}