/**
 * Badge Component
 * 
 * A simple badge component with color variants for displaying labels/tags.
 * 
 * @example
 * ```tsx
 * import Badge from '@/components/Badge';
 * 
 * // Cyan badge
 * <Badge text="RAG Medical" color="cyan" />
 * 
 * // Emerald badge
 * <Badge text="Real-time Telemetry" color="emerald" />
 * 
 * // Purple badge
 * <Badge text="Federated Learning" color="purple" />
 * ```
 * 
 * @param props - Component props
 * @param props.text - The text to display inside the badge
 * @param props.color - Color variant: 'cyan' | 'emerald' | 'purple'
 */

function Badge({ text, color }: { text: string; color: 'cyan' | 'emerald' | 'purple' }) {
  const colors = {
    cyan: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5',
    emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
    purple: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
  };
  
  return (
    <span className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${colors[color]}`}>
      {text}
    </span>
  );
}

export default Badge;
