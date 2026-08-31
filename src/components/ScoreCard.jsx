import { useEffect, useState } from 'react';
import { Info, TrendUp } from '@phosphor-icons/react';
import { scoreHex, scoreState } from '../lib/score';
import { Label, Meter } from './ui';

/** La pieza central de la app: número grande + color + estado + recomendación.
 *  El número cuenta desde el valor anterior en 600ms (respeta prefers-reduced-motion). */
export default function ScoreCard({ score, advice, delta, onWhy }) {
  const shown = useCountUp(score);
  const state = scoreState(score);
  const hex = scoreHex(score);

  return (
    <div className="relative overflow-hidden rounded-lg bg-[linear-gradient(160deg,#232532,#1a1c29)] p-5 pt-[22px] shadow-card">
      {/* glow del color del estado: acento como brillo, nunca como fondo */}
      <div
        className="pointer-events-none absolute -right-[60px] -top-20 h-[230px] w-[230px] rounded-full"
        style={{ background: `radial-gradient(circle, ${hex}2e, transparent 65%)` }}
      />
      <div className="relative flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <Label>Run Score</Label>
          {delta != null && (
            <span className="flex items-center gap-1.5 text-xs text-score-good">
              <TrendUp size={12} />
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
        </div>

        <div className="flex items-end gap-3">
          <span className="num text-[82px] font-semibold leading-[.82] tracking-[-.05em]" style={{ color: hex }}>
            {score == null ? '—' : shown}
          </span>
          <span className="flex flex-col gap-[3px] pb-2">
            <span className="text-base font-medium" style={{ color: hex }}>{state?.label ?? 'Sin datos'}</span>
            <span className="text-xs text-neutral-600">de 100</span>
          </span>
        </div>

        <Meter pct={score ?? 0} color={hex} />

        <p className="m-0 text-[15px] leading-[1.5] text-neutral-300" style={{ textWrap: 'pretty' }}>
          {advice ?? 'Cargá tu primera salida y calculamos tu Score.'}
        </p>

        {score != null && (
          <button onClick={onWhy} className="flex items-center gap-1.5 text-[13px] font-medium text-accent transition-colors hover:text-accent-400">
            <Info size={14} />
            ¿Por qué {score}?
          </button>
        )}
      </div>
    </div>
  );
}

function useCountUp(target, duration = 600) {
  const [value, setValue] = useState(target ?? 0);
  useEffect(() => {
    if (target == null) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return setValue(target);
    const from = value;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}
