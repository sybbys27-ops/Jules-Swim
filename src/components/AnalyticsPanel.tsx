import { useStore } from '../store';
import clsx from 'clsx';

export default function AnalyticsPanel() {
  const {
    currentSpeedKmh, elapsedTime, virtualDistance,
    currentRollAngle, leftArmPhase, rightArmPhase, activeArm, glideHoldRemaining,
    isFinished, result50mTime, resultFinalSpeed, stopSimulation
  } = useStore();

  return (
    <div className="w-80 bg-slate-900 text-slate-100 p-4 flex flex-col gap-6 overflow-y-auto border-l border-slate-700 z-10 relative">
      <h2 className="text-xl font-bold border-b border-slate-700 pb-2">Real-time Analytics</h2>

      <div className="space-y-4">
        <div className="flex flex-col bg-slate-800 p-3 rounded">
          <span className="text-slate-400 text-sm">Current Speed</span>
          <span className="text-3xl font-mono text-emerald-400 font-bold">
            {currentSpeedKmh.toFixed(2)} <span className="text-sm text-slate-500">km/h</span>
          </span>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 flex flex-col bg-slate-800 p-3 rounded">
            <span className="text-slate-400 text-sm">Elapsed Time</span>
            <span className="text-xl font-mono text-cyan-400">
              {elapsedTime.toFixed(1)} <span className="text-sm">s</span>
            </span>
          </div>
          <div className="flex-1 flex flex-col bg-slate-800 p-3 rounded">
            <span className="text-slate-400 text-sm">Distance</span>
            <span className="text-xl font-mono text-blue-400">
              {virtualDistance.toFixed(1)} / 50m
            </span>
          </div>
        </div>

        <div className="bg-slate-800 rounded p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Current Roll:</span>
            <span className="font-mono">{currentRollAngle > 0 ? '+' : ''}{currentRollAngle.toFixed(1)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Glide Hold Left:</span>
            <span className="font-mono">{Math.max(0, glideHoldRemaining).toFixed(1)}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Active Arm:</span>
            <span className="font-semibold text-yellow-400">{activeArm}</span>
          </div>
        </div>

        <div className="flex gap-2 text-sm">
          <div className="flex-1 bg-slate-800 p-3 rounded text-center">
            <div className="text-slate-400 mb-1">Left Arm</div>
            <div className={clsx("font-semibold",
              leftArmPhase !== 'ExtendedForward' && leftArmPhase !== 'Idle' ? "text-indigo-400" : "text-slate-500"
            )}>
              {leftArmPhase}
            </div>
          </div>
          <div className="flex-1 bg-slate-800 p-3 rounded text-center">
            <div className="text-slate-400 mb-1">Right Arm</div>
            <div className={clsx("font-semibold",
              rightArmPhase !== 'ExtendedForward' && rightArmPhase !== 'Idle' ? "text-rose-400" : "text-slate-500"
            )}>
              {rightArmPhase}
            </div>
          </div>
        </div>
      </div>

      {isFinished && (
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm p-4 flex flex-col items-center justify-center z-20">
          <h2 className="text-2xl font-bold text-white mb-6">Simulation Complete</h2>
          <div className="bg-slate-800 w-full p-6 rounded-lg shadow-xl space-y-4 text-center">
            <div>
              <div className="text-slate-400 text-sm">Total Time to 50m</div>
              <div className="text-3xl font-mono text-emerald-400 font-bold mt-1">
                {result50mTime.toFixed(2)}s
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-sm">Final Speed</div>
              <div className="text-xl font-mono text-cyan-400 mt-1">
                {resultFinalSpeed.toFixed(2)} km/h
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-700">
              <div className="text-slate-400 text-sm mb-2">Average Speed</div>
              <div className="text-lg font-mono text-blue-400">
                {((50 / result50mTime) * 3.6).toFixed(2)} km/h
              </div>
            </div>
          </div>
          <button
            onClick={stopSimulation}
            className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition-colors"
          >
            Reset Settings
          </button>
        </div>
      )}
    </div>
  );
}
