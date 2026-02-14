// app/(onboarding)/step-1/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, User, Calendar, Ruler, Weight, ChevronRight, Loader2 } from 'lucide-react';

interface DemographicsFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  sex: string;
  height: string;
  weight: string;
}

export default function DemographicsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<DemographicsFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: 0,
    sex: '',
    height: '',
    weight: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<DemographicsFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'dateOfBirth' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData((prev) => ({ ...prev, age }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<DemographicsFormData> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La fecha de nacimiento es requerida';
    if (!formData.sex) newErrors.sex = 'Selecciona tu sexo biológico';
    if (!formData.height.trim()) newErrors.height = 'La altura es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TODO: Guardar en API real (Prisma + /api/patient/demographics o similar)
      console.log('Guardando demographics:', formData);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      router.push('/onboarding/step-2');
    } catch (err) {
      console.error('Error guardando datos:', err);
      setErrors({ firstName: 'Algo salió mal. Intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header del paso – con pulso sutil */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HeartPulse className="w-8 h-8 text-cyan-500 animate-pulse-slow" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Cuéntanos quién eres
          </h1>
        </div>
        <p className="text-slate-300">
          Estos datos nos ayudan a personalizar tu mapa de salud con precisión quirúrgica.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Nombre completo – grid elegante */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm text-slate-400 mb-2 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-500" /> Nombre
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full bg-slate-950/60 border ${errors.firstName ? 'border-rose-500/60' : 'border-slate-700/40'} rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300`}
              placeholder="Tu nombre"
            />
            {errors.firstName && <p className="mt-1 text-xs text-rose-400">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm text-slate-400 mb-2 font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-500" /> Apellido
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full bg-slate-950/60 border ${errors.lastName ? 'border-rose-500/60' : 'border-slate-700/40'} rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300`}
              placeholder="Tu apellido"
            />
            {errors.lastName && <p className="mt-1 text-xs text-rose-400">{errors.lastName}</p>}
          </div>
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm text-slate-400 mb-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" /> Fecha de nacimiento
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            required
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full bg-slate-950/60 border ${errors.dateOfBirth ? 'border-rose-500/60' : 'border-slate-700/40'} rounded-xl px-5 py-4 text-white focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300`}
          />
          {formData.age > 0 && (
            <p className="mt-2 text-sm text-cyan-400">
              Edad calculada: <span className="font-medium">{formData.age} años</span>
            </p>
          )}
          {errors.dateOfBirth && <p className="mt-1 text-xs text-rose-400">{errors.dateOfBirth}</p>}
        </div>

        {/* Sexo biológico */}
        <div>
          <label htmlFor="sex" className="block text-sm text-slate-400 mb-2 font-medium flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-cyan-500" /> Sexo biológico
          </label>
          <select
            id="sex"
            name="sex"
            required
            value={formData.sex}
            onChange={handleChange}
            className={`w-full bg-slate-950/60 border ${errors.sex ? 'border-rose-500/60' : 'border-slate-700/40'} rounded-xl px-5 py-4 text-white focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300`}
          >
            <option value="">Selecciona...</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
            <option value="other">Otro</option>
            <option value="prefer-not">Prefiero no decir</option>
          </select>
          {errors.sex && <p className="mt-1 text-xs text-rose-400">{errors.sex}</p>}
        </div>

        {/* Altura y Peso – grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="height" className="block text-sm text-slate-400 mb-2 font-medium flex items-center gap-2">
              <Ruler className="w-4 h-4 text-cyan-500" /> Altura
            </label>
            <input
              type="text"
              id="height"
              name="height"
              required
              value={formData.height}
              onChange={handleChange}
              className={`w-full bg-slate-950/60 border ${errors.height ? 'border-rose-500/60' : 'border-slate-700/40'} rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300`}
              placeholder="178 cm o 5'10\""
            />
            {errors.height && <p className="mt-1 text-xs text-rose-400">{errors.height}</p>}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm text-slate-400 mb-2 font-medium flex items-center gap-2">
              <Weight className="w-4 h-4 text-cyan-500" /> Peso (opcional)
            </label>
            <input
              type="text"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              className="w-full bg-slate-950/60 border border-slate-700/40 rounded-xl px-5 py-4 text-white placeholder-slate-500 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/25 transition-all duration-300"
              placeholder="77 kg o 170 lbs"
            />
          </div>
        </div>

        {/* Botón continuar – con shine y pulso */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full py-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:via-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-500 shadow-lg shadow-cyan-950/30 hover:shadow-cyan-900/50 disabled:opacity-50 group overflow-hidden mt-4"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                Continuar al siguiente paso
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Toda tu información está encriptada y nunca se comparte con terceros.
      </p>
    </div>
  );
}