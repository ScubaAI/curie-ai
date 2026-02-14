'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, File, X, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LabFile {
  name: string;
  size: number;
  type: string;
}

export default function LabUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<LabFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validFiles = newFiles.filter(file =>
      validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.pdf')
    );

    const labFiles: LabFile[] = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setFiles(prev => [...prev, ...labFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSkip = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    setIsLoading(false);
    router.push('/patient/overview');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // TODO: Real upload logic (e.g. to S3 or your API)
    console.log('Uploading labs:', files);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    router.push('/patient/overview');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-6 py-12">
      <div className="max-w-2xl mx-auto space-y-10">
        {/* Header – consistente con hero y wearables */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-sm mx-auto">
            <Upload className="w-4 h-4" />
            Subida de laboratorios
          </div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Sube tus resultados de laboratorio
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto">
            Carga análisis recientes para que nuestra IA los integre a tu perfil y genere insights más profundos.
          </p>
        </div>

        {/* Drop Zone – dark, glowing, medical elegance */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${isDragging
              ? 'border-cyan-500/70 bg-cyan-950/30 shadow-cyan-950/20'
              : 'border-slate-700 hover:border-cyan-600/50 bg-slate-900/40 hover:shadow-cyan-950/10'
            }`}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-800/80 flex items-center justify-center text-4xl border border-slate-600/50">
            📄
          </div>
          <p className="text-xl font-semibold text-white mb-3">
            Arrastra y suelta tus resultados aquí
          </p>
          <p className="text-slate-400 mb-6">
            o haz clic para seleccionar archivos (PDF, JPG, PNG, DOC)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="lab-file-upload"
          />
          <label
            htmlFor="lab-file-upload"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors cursor-pointer shadow-lg shadow-cyan-950/30"
          >
            <Upload className="w-5 h-5" />
            Seleccionar archivos
          </label>
        </div>

        {/* Accepted formats – subtle info */}
        <p className="text-center text-sm text-slate-500">
          Formatos aceptados: PDF, JPG, PNG, DOC/DOCX • Máx. 10 MB por archivo
        </p>

        {/* File List – dark cards */}
        {files.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">
                Archivos seleccionados ({files.length})
              </h3>
            </div>
            <div className="divide-y divide-slate-800">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                      {file.type.includes('pdf') ? '📕' : '🖼️'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    aria-label="Eliminar archivo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefits – cyan soft box como en wearables */}
        <div className="bg-cyan-950/30 border border-cyan-900/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5" />
            ¿Por qué subir tus laboratorios?
          </h3>
          <ul className="space-y-3 text-slate-300 text-sm">
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Análisis IA de biomarcadores para insights personalizados
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Seguimiento evolutivo de tus valores a lo largo del tiempo
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Recomendaciones precisas basadas en tus resultados reales
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-400 mt-0.5">✓</span>
              Compartir fácil y seguro con tu médico
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1 py-4 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
          >
            Saltar por ahora
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || files.length === 0}
            className="flex-1 py-4 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-950/30 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>Subiendo<span className="animate-pulse">...</span></>
            ) : (
              <>Completar configuración <ShieldCheck className="w-5 h-5" /></>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 pt-4">
          Puedes subir resultados más tarde desde tu dashboard de salud.
        </p>
      </div>
    </div>
  );
}