import { useStore } from '../store';

export default function RollIndicator() {
  const { currentRollAngle } = useStore();

  return (
    <div className="flex flex-col items-center">
      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Roll</span>
      <div className="relative w-16 h-16 rounded-full border-2 border-slate-600 flex items-center justify-center">
        {/* Horizontal reference line */}
        <div className="absolute w-full h-px bg-slate-600"></div>

        {/* Current roll line */}
        <div
          className="absolute w-12 h-1 bg-cyan-400 rounded-full transition-transform duration-75"
          style={{ transform: `rotate(${-currentRollAngle}deg)` }}
        ></div>

        {/* Center dot */}
        <div className="absolute w-2 h-2 bg-white rounded-full"></div>
      </div>
      <div className="mt-1 font-mono text-cyan-400 text-sm">
        {currentRollAngle > 0 ? '+' : ''}{currentRollAngle.toFixed(1)}°
      </div>
    </div>
  );
}
