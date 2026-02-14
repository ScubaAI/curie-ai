// src/components/doctor/advisor/AdvisorChat.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Send, Loader2, User, Sparkles, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AdvisorChat = ({ patientId, doctorId }: { patientId?: string; doctorId: string }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hola Dr., soy Arkangel AI, tu asesor clínico de precisión. Puedo analizar datos, detectar anomalías y sugerir optimizaciones para tus pacientes. ¿En qué podemos trabajar hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/advisor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    patientId,
                    doctorId
                }),
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, tuve un problema conectando con mi núcleo clínico. Por favor intenta de nuevo.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[700px] bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-md">
            {/* Advisor Header */}
            <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <BrainCircuit className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold leading-none">Arkangel AI Advisor</h3>
                        <p className="text-slate-500 text-xs mt-1.5 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Núcleo de Inteligencia Médica Activo
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat History */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                <AnimatePresence>
                    {messages.map((m, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg ${m.role === 'assistant'
                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                        : 'bg-slate-800'
                                    }`}>
                                    {m.role === 'assistant' ? <Sparkles className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-slate-300" />}
                                </div>

                                <div className={`p-5 rounded-2xl text-sm leading-relaxed ${m.role === 'assistant'
                                        ? 'bg-slate-950 border border-slate-800 text-slate-200'
                                        : 'bg-emerald-600 text-white font-medium shadow-xl shadow-emerald-900/20'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 text-xs animate-pulse">
                                Arkangel está analizando el contexto clínico de tus pacientes...
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-slate-950/80 border-t border-slate-800 backdrop-blur-3xl">
                <div className="relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ej: Análisis de riesgo metabólico para Sofía Rodríguez..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 pl-6 pr-20 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-emerald-900/40"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-[10px] text-slate-600 text-center mt-4 uppercase tracking-widest font-black">
                    Powered by Arkangel AI Precision Medicine Engine
                </p>
            </div>
        </div>
    );
};
