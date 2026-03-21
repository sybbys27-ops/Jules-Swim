import { useStore } from '../store';
import RollIndicator from './RollIndicator';

export default function TopStatus() {
  const { currentState } = useStore();

  return (
    <div className="absolute top-0 left-80 right-80 p-4 z-10 pointer-events-none flex justify-center">
      <div className="bg-slate-900/80 backdrop-blur rounded-lg shadow-lg border border-slate-700 p-4 flex gap-8 items-center pointer-events-auto">
        <div className="flex flex-col">
          <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">State</span>
          <span className="text-white font-mono text-lg">{currentState}</span>
        </div>

        <div className="w-px h-10 bg-slate-700"></div>

        <RollIndicator />
      </div>
    </div>
  );
}
