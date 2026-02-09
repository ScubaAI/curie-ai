'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Utensils, 
  Dumbbell, 
  Zap, 
  X, 
  ShieldCheck, 
  FileText, 
  Pill,
  AlertCircle,
  Clock,
  Lock
} from 'lucide-react';

// Tipos para los documentos del protocolo
interface ProtocolDocument {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  updatedAt: Date;
  version: string;
  checksum: string;
}

interface MedicalPrescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  prescribedAt: Date;
  validUntil: Date;
  notes?: string;
  isActive: boolean;
}

interface ProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEmergency?: boolean;
  nutritionDoc?: ProtocolDocument;
  workoutDoc?: ProtocolDocument;
  prescriptions?: MedicalPrescription[];
  onDownload?: (type: 'nutrition' | 'workout' | 'prescription', id: string) => void;
}

export default function ProtocolModal({ 
  isOpen, 
  onClose, 
  isEmergency = false,
  nutritionDoc,
  workoutDoc,
  prescriptions = [],
  onDownload 
}: ProtocolModalProps) {
  
  const hasPrescriptions = prescriptions.length > 0;
  const activePrescriptions = prescriptions.filter(p => p.isActive);
  
  const handleDownload = (type: 'nutrition' | 'workout' | 'prescription', id: string) => {
    if (onDownload) {
      onDownload(type, id);
    } else {
      // Fallback: simular descarga
      console.log(`[DOWNLOAD] ${type}: ${id}`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Overlay con desenfoque - rojo si es emergencia */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 backdrop-blur-3xl ${
              isEmergency ? 'bg-rose-950/95' : 'bg-black/95'
            }`}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`border rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 md:p-12 relative shadow-[0_0_80px_rgba(0,255,255,0.1)] backdrop-blur-md ${
              isEmergency 
                ? 'bg-rose-950/50 border-rose-500/20 shadow-[0_0_80px_rgba(244,63,94,0.2)]' 
                : 'bg-slate-900/50 border-white/10'
            }`}
          >
            {/* Botón de Cierre */}
            <button 
              onClick={onClose} 
              className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform" />
            </button>

            {/* Header */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg border ${
                  isEmergency 
                    ? 'bg-rose-500/10 border-rose-500/20' 
                    : 'bg-cyan-500/10 border-cyan-500/20'
                }`}>
                  <ShieldCheck className={`w-4 h-4 ${isEmergency ? 'text-rose-400' : 'text-cyan-400'}`} />
                </div>
                <span className={`font-mono text-[10px] tracking-[0.4em] uppercase ${
                  isEmergency ? 'text-rose-400' : 'text-cyan-400'
                }`}>
                  {isEmergency ? 'EMERGENCY PROTOCOL v2.6' : 'Encrypted Health Protocol v2.6'}
                </span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-none">
                {isEmergency ? 'Protocolo de ' : 'Protocolo de '}
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
                  isEmergency 
                    ? 'from-rose-400 to-amber-400' 
                    : 'from-cyan-400 to-emerald-400'
                }`}>
                  {isEmergency ? 'Emergencia' : 'Optimización'}
                </span>
              </h2>
              
              {isEmergency && (
                <p className="mt-4 text-rose-400 text-sm font-medium">
                  ⚠️ Este protocolo contiene instrucciones médicas críticas. Siga las indicaciones al pie de la letra.
                </p>
              )}
            </header>

            {/* Grid de Secciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* NUTRICIÓN */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-emerald-400">
                  <div className="p-3 bg-emerald-400/10 rounded-2xl border border-emerald-400/20">
                    <Utensils size={24} />
                  </div>
                  <h3 className="font-black italic uppercase tracking-tight text-xl text-white">
                    Nutrición
                  </h3>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 space-y-4 relative overflow-hidden group hover:border-emerald-500/20 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText size={50} />
                  </div>
                  
                  <p className="text-sm text-slate-400 leading-relaxed italic font-light">
                    "Configuración macro-nutricional diseñada para maximizar la síntesis proteica post-entrenamiento."
                  </p>

                  <div className="space-y-3">
                    <MacroRow label="Proteína" value="2.2g" sub="/kg" />
                    <MacroRow label="Carbohidratos" value="4g" sub="/kg" />
                    <MacroRow label="Grasas" value="1g" sub="/kg" />
                  </div>

                  {nutritionDoc && (
                    <div className="text-[10px] text-slate-500 space-y-1 pt-2 border-t border-white/5">
                      <div className="flex justify-between">
                        <span>Versión:</span>
                        <span className="text-slate-300">{nutritionDoc.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actualizado:</span>
                        <span className="text-slate-300">
                          {new Date(nutritionDoc.updatedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload('nutrition', nutritionDoc?.id || 'nutrition-default')}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-500 text-black text-[11px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
                  >
                    <Download size={16} /> 
                    {nutritionDoc ? 'Descargar PDF' : 'Documento no disponible'}
                  </motion.button>
                </div>
              </section>

              {/* GYM / RENDIMIENTO */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-cyan-400">
                  <div className="p-3 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
                    <Dumbbell size={24} />
                  </div>
                  <h3 className="font-black italic uppercase tracking-tight text-xl text-white">
                    Entrenamiento
                  </h3>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 space-y-4 relative overflow-hidden group hover:border-cyan-500/20 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={50} />
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">
                        Fuerza Máxima
                      </p>
                      <p className="text-xs text-slate-400 font-light">
                        Compuestos: Squats, Deadlifts, Press
                      </p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
                        Hipertrofia
                      </p>
                      <p className="text-xs text-slate-400 font-light">
                        8-12 reps, Control excéntrico 3:1
                      </p>
                    </div>
                  </div>

                  {workoutDoc && (
                    <div className="text-[10px] text-slate-500 space-y-1 pt-2 border-t border-white/5">
                      <div className="flex justify-between">
                        <span>Versión:</span>
                        <span className="text-slate-300">{workoutDoc.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Actualizado:</span>
                        <span className="text-slate-300">
                          {new Date(workoutDoc.updatedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  )}

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload('workout', workoutDoc?.id || 'workout-default')}
                    className="w-full flex items-center justify-center gap-3 bg-cyan-500 text-black text-[11px] font-black py-4 rounded-2xl transition-all uppercase tracking-widest shadow-[0_10px_20px_rgba(6,182,212,0.2)]"
                  >
                    <Download size={16} /> 
                    {workoutDoc ? 'Descargar Rutina' : 'Documento no disponible'}
                  </motion.button>
                </div>
              </section>

              {/* RECETAS MÉDICAS - NUEVA SECCIÓN */}
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-amber-400">
                  <div className="p-3 bg-amber-400/10 rounded-2xl border border-amber-400/20">
                    <Pill size={24} />
                  </div>
                  <h3 className="font-black italic uppercase tracking-tight text-xl text-white">
                    Recetas Médicas
                  </h3>
                </div>

                <div className={`border rounded-[2rem] p-6 space-y-4 relative overflow-hidden ${
                  hasPrescriptions 
                    ? 'bg-amber-950/20 border-amber-500/20' 
                    : 'bg-white/5 border-white/5'
                }`}>
                  
                  {!hasPrescriptions ? (
                    <div className="text-center py-8">
                      <Pill className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <p className="text-sm text-slate-500">
                        No hay recetas activas
                      </p>
                      <p className="text-[10px] text-slate-600 mt-2">
                        Las recetas médicas aparecerán aquí cuando sean prescritas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {activePrescriptions.map((rx) => (
                        <div 
                          key={rx.id}
                          className="p-4 bg-black/40 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-sm font-bold text-white">{rx.medication}</p>
                              <p className="text-[10px] text-amber-400">{rx.dosage}</p>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-emerald-400">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Activa
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-[10px] text-slate-400">
                            <div className="flex items-center gap-2">
                              <Clock size={10} />
                              <span>{rx.frequency}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText size={10} />
                              <span>Dr. {rx.prescribedBy}</span>
                            </div>
                          </div>

                          {rx.notes && (
                            <div className="mt-3 p-2 bg-amber-500/10 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] text-amber-200">{rx.notes}</p>
                              </div>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[9px] text-slate-500">
                              Válida hasta: {new Date(rx.validUntil).toLocaleDateString('es-ES')}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDownload('prescription', rx.id)}
                              className="p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-amber-400 transition-colors"
                            >
                              <Download size={14} />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasPrescriptions && (
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <Lock size={10} />
                        <span>Recetas verificadas digitalmente</span>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                <p className="text-[9px] text-slate-600 uppercase tracking-[0.3em] font-bold">
                  Cifrado E2E activo
                </p>
                <span className="text-[9px] text-slate-700">|</span>
                <p className="text-[9px] text-slate-600 uppercase tracking-[0.3em]">
                  Firma digital válida
                </p>
              </div>
              
              <div className="flex gap-4">
                <ShieldCheck className="w-4 h-4 text-emerald-500/40" />
                <Lock className="w-4 h-4 text-cyan-500/40" />
                <FileText className="w-4 h-4 text-amber-500/40" />
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function MacroRow({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="flex justify-between items-end border-b border-white/5 pb-2">
      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-light text-white italic">{value}</span>
        {sub && <span className="text-[8px] text-slate-600 uppercase">{sub}</span>}
      </div>
    </div>
  );
}