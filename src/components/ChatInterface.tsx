'use client';

import { useState, useRef, useEffect } from 'react';

// Estructura de mensajes para el historial
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Usamos 'any' para evitar que TypeScript bloquee el build si page.tsx envía datos extra
interface ChatInterfaceProps {
  telemetry: any; 
  isEmergency?: boolean;
}

export default function ChatInterface({ telemetry, isEmergency = false }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'NEXUS ACTIVO. Soy Curie, tu IA médica. Abraham, he cargado tus métricas. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // LOGS DE DIAGNÓSTICO
  useEffect(() => {
    console.log('[CURIE DEBUG] Telemetría recibida:', telemetry);
    console.log('[CURIE DEBUG] Modo Emergencia:', isEmergency);
  }, [telemetry, isEmergency]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      console.log("[CURIE] Enviando petición al servidor...");
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ 
            role: m.role, 
            content: m.content 
          })),
          telemetry 
        }),
      });

      // PASO CRÍTICO: Capturamos el texto plano primero para ver si es error o JSON
      const rawText = await response.text();
      console.log('[CURIE DEBUG] Respuesta bruta del servidor:', rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        throw new Error(`El servidor no respondió con JSON. Respuesta recibida: ${rawText.substring(0, 50)}...`);
      }

      if (!response.ok) {
        throw new Error(data.content || `Error del servidor (Status: ${response.status})`);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }]);

    } catch (error: any) {
      console.error("Error detallado en el chat:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error de Conexión: ${error.message}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-slate-900/50 border border-cyan-500/20 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
      {/* HEADER SIMPLE */}
      <div className="p-4 border-b border-cyan-500/10 bg-slate-900/80 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isEmergency ? 'bg-red-500 animate-ping' : 'bg-cyan-400'}`} />
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-tighter">
            Curie Nexus v1.0 {isEmergency && '• EMERGENCY_MODE'}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono italic">Abraham_ID: 71KG_SYNC</span>
      </div>

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50' 
                : 'bg-slate-800/80 border border-slate-700/50 text-cyan-50'
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <span className="text-[9px] opacity-30 mt-2 block text-right font-mono">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 p-3 rounded-2xl animate-pulse text-cyan-500 text-xs font-mono">
              CURIE ESTÁ PENSANDO...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ÁREA DE INPUT */}
      <div className="p-4 bg-slate-900/80 border-t border-cyan-500/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isEmergency ? "Reportar síntoma urgente..." : "Escribe tu consulta..."}
            className="flex-1 bg-black/40 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20"
          >
            {isLoading ? '...' : 'ENVIAR'}
          </button>
        </div>
      </div>
    </div>
  );
}