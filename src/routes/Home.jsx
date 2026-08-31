import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CaretRight, Sneaker, Trophy } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { useSession } from '../store/session';
import { Screen } from '../components/Screen';
import ScoreCard from '../components/ScoreCard';
import { Button, EmptyState, Label, Skeleton } from '../components/ui';
import { fmtDistance, fmtDuration, fmtLongDate, fmtPace, initials, paceFrom } from '../lib/format';

export default function Home() {
  const nav = useNavigate();
  const { profile } = useSession();
  const name = profile?.display_name ?? 'corredor';

  const { data, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: async () => {
      const [score, last, pr] = await Promise.all([
        supabase.from('scores').select('*').order('date', { ascending: false }).limit(2),
        supabase.from('workouts').select('*').order('date', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('personal_records').select('*').order('achieved_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      const [today, prev] = score.data ?? [];
      return { today, prev, last: last.data, pr: pr.data };
    },
  });

  const today = data?.today;
  const delta = today && data?.prev ? today.value - data.prev.value : null;

  return (
    <Screen>
      <header className="flex items-center justify-between pb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] capitalize text-neutral-600">{fmtLongDate()}</span>
          <span className="text-[22px] font-medium tracking-[-.02em]">Hola, {name.split(' ')[0]}</span>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm text-neutral-400 shadow-edge">
          {initials(name)}
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-[280px]" />
        ) : (
          <ScoreCard score={today?.value ?? null} advice={today?.advice} delta={delta} onWhy={() => nav('/coach')} />
        )}

        {!isLoading && !data?.last && (
          <EmptyState
            title="Todavía no hay nada que medir"
            body="Cargá tu primera salida y en el momento te decimos cómo estás y qué conviene hacer mañana."
            action={<Button onClick={() => nav('/entrenos/nuevo')}>Registrar mi primera salida</Button>}
          />
        )}

        {today && (
          <div className="flex gap-3">
            <Gauge label="Recuperación" value={today.factors?.recovery_label ?? '—'} filled={today.factors?.recovery_steps ?? 0} color="#8fc98a" />
            <Gauge label="Carga" value={today.factors?.load_label ?? '—'} filled={today.factors?.load_steps ?? 0} color="#df9f6f" />
          </div>
        )}

        {data?.last && (
          <button onClick={() => nav('/entrenos')} className="flex items-center gap-3.5 rounded bg-card p-4 text-left shadow-hairline">
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-surface text-neutral-400 shadow-[inset_0_0_0_1px_#3f424d]">
              <Sneaker size={20} />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <Label>Última salida</Label>
              <span className="num text-[15px]">
                {fmtDistance(data.last.distance_km)} km · {fmtDuration(data.last.duration_s)} ·{' '}
                {fmtPace(paceFrom(data.last.distance_km, data.last.duration_s))} /km
              </span>
            </span>
            <CaretRight size={14} className="text-neutral-700" />
          </button>
        )}

        {data?.pr && (
          <div className="flex items-center gap-3.5 rounded bg-[linear-gradient(150deg,#252042,#1a1c29)] p-4 shadow-[0_0_0_1px_#423a6a]">
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-accent/[.14] text-accent-400 shadow-[inset_0_0_0_1px_rgba(145,132,217,.5)]">
              <Trophy size={20} />
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <Label className="text-accent-400">Nuevo PR</Label>
              <span className="num text-[15px]">
                {data.pr.distance_key.toUpperCase()} en {fmtDuration(data.pr.duration_s)}
              </span>
            </span>
            <button className="text-[13px] font-medium text-accent">Compartir</button>
          </div>
        )}
      </div>
    </Screen>
  );
}

function Gauge({ label, value, filled, color }) {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded bg-card p-3.5 shadow-hairline">
      <Label>{label}</Label>
      <span className="text-xl font-medium">{value}</span>
      <div className="flex gap-[3px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[3px] flex-1 rounded-sm" style={{ background: i < filled ? color : '#2f3240' }} />
        ))}
      </div>
    </div>
  );
}
