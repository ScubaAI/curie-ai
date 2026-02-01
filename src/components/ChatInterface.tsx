'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Cpu, User, Activity, Scale } from 'lucide-react';

export default function ChatInterface({ telemetry, isEmergency }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hola Abraham, veo que pesas ${telemetry.weight}kg. ¿En qué puedo ayudarte hoy?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          telemetry 
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Error');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }]);

    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Error de conexión. Intenta de nuevo.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border border-cyan-500/10 rounded-3xl overflow-hidden">
      <div className="bg-slate-900/40 border-b border-cyan-500/10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-cyan-400" />
          <h3 className="text-white font-bold text-sm">Curie Intelligence</h3>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-rose-400">{telemetry.bpm} BPM</span>
          <span className="text-emerald-400">{telemetry.weight} kg</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-cyan-50'}`}>
              <p className="text-sm">{m.content}</p>
            </div>
          </div>
        ))}
        {isTyping && <p className="text-xs text-cyan-500 animate-pulse">Escribiendo...</p>}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-slate-900/40 border-t border-cyan-500/10 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe tu consulta..."
          className="flex-1 bg-black/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
        />
        <button onClick={sendMessage} className="bg-cyan-600 p-2 rounded-lg text-white hover:bg-cyan-500">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}