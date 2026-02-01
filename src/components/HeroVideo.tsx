'use client';
import { motion } from 'framer-motion';

export default function HeroVideo() {
  return (
    <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden bg-black">

      {/* Video background – sugerencia: abstracto biométrico en cian/aqua, pulsos suaves, datos fluyendo hacia nodos médicos */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" /> {/* ← Reemplaza con el video de partículas vitales / heartbeat etéreo */}
      </video>

      {/* Overlays – glow médico refinado, muy sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/15 to-black/75" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,230,255,0.10),transparent_70%)]" />

      {/* Contenido principal – centrado, mobile-first, tipografía premium */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 sm:px-12 lg:px-24">

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          {/* Título Curie – gradiente cian médico elegante */}
          <h1 
            className="
              text-7xl sm:text-9xl md:text-[12rem] lg:text-[14rem] 
              font-black tracking-[-0.06em] 
              bg-gradient-to-r from-white via-cyan-200 to-cyan-500 
              bg-clip-text text-transparent 
              leading-none mb-6 md:mb-10
            "
          >
            Curie
          </h1>

          {/* Wording elegido – limpio, impactante, sin saturación */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="space-y-3 md:space-y-6"
          >
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight">
              Open medical intelligence.
            </p>

            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-cyan-300 leading-tight">
              Real-time biometrics.
            </p>

            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white leading-tight">
              Endless knowledge.
            </p>

            {/* Línea secundaria en español – sutil, para conexión emocional */}
            <p className="mt-8 md:mt-12 text-lg sm:text-xl md:text-2xl font-light text-cyan-400/80 tracking-wide uppercase">
              IA médica open source · Datos biométricos en tiempo real ·
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Detalle inferior sutil – branding Visionary AI */}
      <div className="absolute bottom-10 left-0 right-0 text-center z-10">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="text-sm md:text-base text-slate-500/80 font-light tracking-widest"
        >
          Visionary AI
        </motion.p>
      </div>

    </section>
  );
}