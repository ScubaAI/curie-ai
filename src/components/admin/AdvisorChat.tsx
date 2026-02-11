// src/components/admin/AdvisorChat.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Activity, 
  AlertCircle,
  TrendingUp,
  Zap,
  FileText,
  X
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    url: string;
    relevance: number;
  }>;
  tokensUsed?: number;
}

interface UploadedFile {
  file_id: string;
  filename: string;
  mime_type: string;
}

interface AdvisorChatProps {
  patientId: string;
  phaseAngle: number | null;
  patientName?: string;
  patientAge?: number | null;
  patientHeight?: number | null;
}

const SYSTEM_CONTEXT = (phaseAngle: number | null, patientName: string, age: number | null | undefined, height: number | null | undefined) => ({
  patient_name: patientName,
  patient_id: "abraham-001",
  patient_age: age,
  patient_height_cm: height,
  current_phase_angle: phaseAngle,
  patient_type: "athlete_trt_diver",
  monitoring_protocol: "quarterly_labs_monthly_composition",
  critical_thresholds: {
    phase_angle_low: 5.5,
    phase_angle_critical: 4.5,
    dcs_risk_elevated: true
  }
});

export function AdvisorChat({ 
  patientId, 
  phaseAngle, 
  patientName = "Abraham",
  patientAge,
  patientHeight
}: AdvisorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mensaje inicial basado en ángulo de fase
  useEffect(() => {
    if (messages.length === 0 && phaseAngle !== null) {
      const initialGreeting = generateInitialAssessment(phaseAngle, patientName);
      setMessages([
        {
          id: "init",
          role: "assistant",
          content: initialGreeting,
          timestamp: new Date(),
          sources: [{
            title: "InBody Interpretation Guidelines",
            url: "https://www.inbody.com/resources/phase-angle",
            relevance: 0.92
          }]
        }
      ]);
    }
  }, [phaseAngle, patientName]);

  const generateInitialAssessment = (angle: number, name: string): string => {
    if (angle >= 6 && angle <= 8) {
      return `**Estado Celular Óptimo** (${angle}°)\n\nEl ángulo de fase de ${name} se encuentra en rango atlético ideal (6-8°). Esto indica:\n\n• **Integridad de membranas celulares** preservada\n• **Masa muscular esquelética** bien hidratada  \n• **Recuperación post-entreno** eficiente\n• **Riesgo de catabolismo** mínimo\n\n¿En qué puedo asistirte con el análisis de este paciente?`;
    } else if (angle < 6) {
      return `⚠️ **Atención: Ángulo de Fase Subóptimo** (${angle}°)\n\nPor debajo del umbral atlético (6°). Posibles implicaciones:\n\n• **Sobrecronización:** Revisar volumen de entrenamiento\n• **Nutrición peri-entreno:** Verificar timing de proteínas\n• **Recuperación:** Evaluar calidad del sueño (correlación HRV)\n• **Hidratación:** Posible desbalance electrolítico\n\n**Sugerencia:** Analizar correlación con cortisol AM y testosterona libre.\n\n¿Deseas que profundice en algún aspecto específico?`;
    } else {
      return `**Ángulo de Fase Elevado** (${angle}°)\n\nPor encima de rango típico atlético. Consideraciones:\n\n• **Hiperhidratación celular** - Verificar ratio TBW/ECW\n• **Estado anabólico pronunciado** (positivo si intencional)\n• **Artefacto de medición** - Confirmar posición estándar y ayuno\n\n**Validar:** ¿Medición post-carga de creatina o carbohidratos?\n\n¿Necesitas análisis adicional?`;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "analysis");

    try {
      const res = await fetch("/api/arkangel/files", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      setUploadedFiles(prev => [...prev, data]);
    } catch (err) {
      console.error("[FILE_UPLOAD]:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.file_id !== fileId));
    // Opcional: llamar a DELETE /api/arkangel/files/{fileId}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || `Analizar ${uploadedFiles.length} archivo(s) adjunto(s)`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/arkangel/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversation_id: conversationId,
          context: SYSTEM_CONTEXT(phaseAngle, patientName, patientAge, patientHeight),
          file_ids: uploadedFiles.map(f => f.file_id),
          language: "es"
        })
      });

      if (!res.ok) throw new Error("Arkangel error");

      const data = await res.json();
      
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMessage: Message = {
        id: data.id || (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(data.created_at),
        sources: data.sources,
        tokensUsed: data.tokens_used
      };

      setMessages(prev => [...prev, assistantMessage]);
      setUploadedFiles([]); // Limpiar archivos después de enviar
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Error de conexión con Arkangel AI. Por favor intente nuevamente.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { icon: Activity, label: "Analizar tendencia", prompt: "Analiza la tendencia de ángulo de fase y correlación con masa muscular en las últimas mediciones disponibles" },
    { icon: Zap, label: "Optimizar recuperación", prompt: "Basado en el ángulo de fase actual y el perfil de atleta+buceador, ¿qué ajustes sugieres para mejorar recuperación celular?" },
    { icon: TrendingUp, label: "Correlación hormonal", prompt: "¿Cuál es la correlación esperada entre ángulo de fase y panel hormonal (testosterona, cortisol) en pacientes en TRT?" },
    { icon: AlertCircle, label: "Flags de seguridad", prompt: "Evalúa si hay flags de seguridad para inmersión técnica profunda basado en el estado celular actual" }
  ];

  if (!isExpanded) {
    return (
      <motion.button
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-600 hover:bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/30 flex items-center justify-center transition-colors z-50"
      >
        <Bot className="w-6 h-6 text-white" />
        {phaseAngle && (
          <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${
            phaseAngle >= 6 ? "bg-emerald-500" : phaseAngle >= 5 ? "bg-yellow-500" : "bg-red-500"
          }`} />
        )}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/95 border border-slate-700 rounded-2xl overflow-hidden flex flex-col h-full backdrop-blur-md shadow-2xl"
    >
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Curie Advisor</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Arkangel AI • Fuentes médicas verificadas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Subir archivo"
          >
            <FileText className="w-5 h-5" />
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            className="hidden" 
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.png,.webp,.txt,.md"
          />
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Phase Angle Badge */}
      {phaseAngle !== null && (
        <div className="px-4 py-2 bg-slate-800/30 border-b border-slate-700/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Ángulo de Fase</span>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className={`text-sm font-black ${
              phaseAngle >= 6 && phaseAngle <= 8 ? "text-emerald-400" : 
              phaseAngle < 6 ? "text-amber-400" : "text-cyan-400"
            }`}>
              {phaseAngle.toFixed(1)}°
            </span>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 bg-slate-800/20 border-b border-slate-700/50 flex gap-2 flex-wrap">
          {uploadedFiles.map(file => (
            <span key={file.file_id} className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400">
              {file.filename}
              <button onClick={() => removeFile(file.file_id)} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant" 
                  ? "bg-gradient-to-br from-cyan-500 to-blue-600" 
                  : "bg-slate-700"
              }`}>
                {msg.role === "assistant" ? (
                  <Bot className="w-4 h-4 text-white" />
                ) : (
                  <User className="w-4 h-4 text-slate-300" />
                )}
              </div>
              
              <div className={`max-w-[80%] space-y-2 ${msg.role === "user" ? "items-end" : ""}`}>
                <div className={`p-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-slate-800/50 border border-slate-700 text-slate-200"
                    : "bg-cyan-600 text-white"
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('•') || line.startsWith('**') ? "mt-1" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
                
                {msg.sources && msg.sources.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Fuentes</p>
                    {msg.sources.map((source, i) => (
                      <a 
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-cyan-400 hover:text-cyan-300 truncate"
                      >
                        {source.title} ({Math.round(source.relevance * 100)}% relevancia)
                      </a>
                    ))}
                  </div>
                )}
                
                {msg.tokensUsed && (
                  <p className="text-[10px] text-slate-600">
                    {msg.tokensUsed} tokens
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-slate-500 text-sm"
          >
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            Consultando Arkangel AI...
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length < 3 && (
        <div className="px-4 py-2 border-t border-slate-700/50 flex gap-2 overflow-x-auto scrollbar-hide">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.label}
              onClick={() => setInput(prompt.prompt)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-xs text-slate-300 whitespace-nowrap transition-colors"
            >
              <prompt.icon className="w-3 h-3 text-cyan-400" />
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700 bg-slate-800/30">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isUploading ? "Subiendo archivo..." : "Consulta clínica o arrastra archivo..."}
            disabled={isUploading}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading || isUploading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-600 disabled:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          Arkangel AI • Fuentes médicas verificadas • No reemplaza juicio clínico
        </p>
      </form>
    </motion.div>
  );
}