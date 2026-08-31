import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Export } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { Screen } from '../components/Screen';
import { IconButton, Label, Segmented, Skeleton } from '../components/ui';
import { fmtDuration } from '../lib/format';

export default function Progress() {
  const [range, setRange] = useState('Mes');

  const { data, isLoading } = useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      const [scores, pr] = await Promise.all([
        supabase.from('scores').select('date,value').order('date', { ascending: true }).limit(56),
        supabase.from('personal_records').select('*').order('achieved_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      return { scores: scores.data ?? [], pr: pr.data };
    },
  });

  if (isLoading) return <Screen><Skeleton className="h-[400px]" /></Screen>;

  return (
    <Screen>
      <header className="flex items-baseline justify-between pb-4">
        <h1 className="text-[22px]">Mi progreso</h1>
        <div className="w-[190px]"><Segmented options={['Sem', 'Mes', 'Año']} value={range} onChange={setRange} /></div>
      </header>

      <div className="flex flex-col gap-4">
        {data.pr && (
          <div className="relative overflow-hidden rounded-lg bg-[linear-gradient(150deg,#252042,#1a1c29)] p-[18px] shadow-[0_0_0_1px_#423a6a]">
            <div className="pointer-events-none absolute -right-[50px] -top-[70px] h-[200px] w-[200px] rounded-full bg-[radial-gradient(circle,rgba(145,132,217,.28),transparent_65%)]" />
            <div className="relative flex items-center gap-4">
              <span className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[12px] bg-accent/[.16] text-accent-400 shadow-[inset_0_0_0_1px_rgba(145,132,217,.5)]">
                <Trophy size={24} />
              </span>
              <span className="flex flex-1 flex-col gap-[3px]">
                <Label className="text-accent-400">Nuevo PR</Label>
                <span className="num text-[21px] font-medium">
                  {data.pr.distance_key.toUpperCase()} · {fmtDuration(data.pr.duration_s)}
                </span>
                {data.pr.previous_duration_s && (
                  <span className="text-[13px] text-score-good">
                    Mejoraste {data.pr.previous_duration_s - data.pr.duration_s} segundos
                  </span>
                )}
              </span>
              <IconButton className="h-9 w-9" aria-label="Compartir"><Export size={17} /></IconButton>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3.5 rounded bg-card p-[18px] shadow-hairline">
          <div className="flex items-baseline justify-between">
            <Label>Evolución del Run Score</Label>
            {data.scores.length > 1 && (
              <span className="text-[13px] text-score-good">
                +{data.scores.at(-1).value - data.scores[0].value} en el período
              </span>
            )}
          </div>
          <ScoreLine points={data.scores.map((s) => s.value)} />
        </div>
      </div>
    </Screen>
  );
}

/** Línea suave, nunca un dashboard denso: una serie, un punto final destacado. */
function ScoreLine({ points }) {
  if (points.length < 2) return <p className="m-0 text-sm text-neutral-600">Necesitás al menos dos días con Score.</p>;
  const W = 320, H = 96, pad = 6;
  const xs = points.map((_, i) => pad + (i * (W - pad * 2)) / (points.length - 1));
  const ys = points.map((v) => H - pad - ((v / 100) * (H - pad * 2)));
  const d = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-24 w-full" fill="none">
      <line x1="0" y1="20" x2={W} y2="20" stroke="#2f3240" />
      <line x1="0" y1="58" x2={W} y2="58" stroke="#2f3240" />
      <path d={`${d} L${W} ${H} L0 ${H} Z`} fill="rgb(145 132 217 / .13)" />
      <path d={d} stroke="#9184d9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs.at(-1)} cy={ys.at(-1)} r="9" fill="rgb(145 132 217 / .2)" />
      <circle cx={xs.at(-1)} cy={ys.at(-1)} r="4.5" fill="#9184d9" />
    </svg>
  );
}
