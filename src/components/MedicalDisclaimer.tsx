// Solo una línea de texto
export default function MedicalDisclaimer() {
  return (
    <div className="text-center py-3 text-[9px] text-slate-600 uppercase tracking-[0.15em]">
      <span className="text-amber-500/60">⚠</span> Curie es información educativa, 
      no sustituye opinión médica •{' '}
      <a href="/legal" className="hover:text-slate-400 underline">Ver disclaimer completo</a>
    </div>
  );
}