import { useStore } from '../store';

export default function SettingsPanel() {
  const {
    rollingAngle, setRollingAngle,
    strokeInterval, setStrokeInterval,
    glideHold, setGlideHold,
    bodyPitch, setBodyPitch,
    isRunning, startSimulation, stopSimulation
  } = useStore();

  return (
    <div className="w-80 bg-slate-800 text-white p-4 flex flex-col gap-6 overflow-y-auto border-r border-slate-700 z-10">
      <h2 className="text-xl font-bold">Parameter Controls</h2>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between">
          <span>Rolling Angle</span>
          <span className="font-mono">{rollingAngle}°</span>
        </label>
        <input
          type="range" min="0" max="75" step="5"
          value={rollingAngle}
          onChange={e => setRollingAngle(Number(e.target.value))}
          disabled={isRunning}
          className="accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>0°</span><span>75°</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between">
          <span>Stroke Interval</span>
          <span className="font-mono">{strokeInterval.toFixed(1)}s</span>
        </label>
        <input
          type="range" min="3.0" max="5.0" step="0.5"
          value={strokeInterval}
          onChange={e => setStrokeInterval(Number(e.target.value))}
          disabled={isRunning}
          className="accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>3.0s</span><span>5.0s</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between">
          <span>Glide Hold</span>
          <span className="font-mono">{glideHold.toFixed(1)}s</span>
        </label>
        <input
          type="range" min="0.0" max="2.0" step="0.5"
          value={glideHold}
          onChange={e => setGlideHold(Number(e.target.value))}
          disabled={isRunning}
          className="accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>0.0s</span><span>2.0s</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex justify-between">
          <span>Body Pitch</span>
          <span className="font-mono">{bodyPitch > 0 ? '+' : ''}{bodyPitch}°</span>
        </label>
        <input
          type="range" min="-5" max="5" step="1"
          value={bodyPitch}
          onChange={e => setBodyPitch(Number(e.target.value))}
          disabled={isRunning}
          className="accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>-5°</span><span>+5°</span>
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        {!isRunning ? (
          <button
            onClick={startSimulation}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded font-bold transition-colors"
          >
            시작 (Start)
          </button>
        ) : (
          <button
            onClick={stopSimulation}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded font-bold transition-colors"
          >
            중단 (Stop)
          </button>
        )}
      </div>
    </div>
  );
}
