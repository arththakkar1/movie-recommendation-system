"use client";

interface Props {
  wSim: number;
  wVote: number;
  wPop: number;
  onChange: (wSim: number, wVote: number, wPop: number) => void;
}

function clamp(v: number) {
  return Math.min(1, Math.max(0, v));
}

export default function WeightSliders({ wSim, wVote, wPop, onChange }: Props) {
  function handleChange(key: "sim" | "vote" | "pop", raw: number) {
    const val = clamp(raw);
    const rest = clamp(1 - val);
    if (key === "sim") {
      const ratio = wVote + wPop > 0 ? wVote / (wVote + wPop) : 0.5;
      onChange(val, clamp(rest * ratio), clamp(rest * (1 - ratio)));
    } else if (key === "vote") {
      const ratio = wSim + wPop > 0 ? wSim / (wSim + wPop) : 0.5;
      onChange(clamp(rest * ratio), val, clamp(rest * (1 - ratio)));
    } else {
      const ratio = wSim + wVote > 0 ? wSim / (wSim + wVote) : 0.5;
      onChange(clamp(rest * ratio), clamp(rest * (1 - ratio)), val);
    }
  }

  const sliders = [
    { key: "sim" as const, label: "w_sim", desc: "Content similarity", value: wSim, color: "accent-violet-500" },
    { key: "vote" as const, label: "w_vote", desc: "Vote average", value: wVote, color: "accent-sky-500" },
    { key: "pop" as const, label: "w_pop", desc: "Popularity", value: wPop, color: "accent-emerald-500" },
  ];

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl bg-white/5 border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Hybrid Weights</p>
        <p className="text-xs font-mono text-white/40">
          Σ = {(wSim + wVote + wPop).toFixed(2)}
        </p>
      </div>
      {sliders.map(({ key, label, desc, value, color }) => (
        <div key={key} className="space-y-1.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-violet-300">{label}</code>
              <span className="text-xs text-white/40">{desc}</span>
            </div>
            <span className="text-xs font-mono text-white/70">{value.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={value}
            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
            className={`w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer ${color}`}
          />
        </div>
      ))}
    </div>
  );
}
