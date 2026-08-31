import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { Screen } from '../components/Screen';
import { EmptyState, IconButton, Label, Segmented, Skeleton } from '../components/ui';
import { fmtDistance, fmtDuration, fmtPace, paceFrom } from '../lib/format';

const RANGES = { Semana: 7, Mes: 30, Año: 365 };

export default function History() {
  const nav = useNavigate();
  const [range, setRange] = useState('Mes');

  const { data, isLoading } = useQuery({
    queryKey: ['workouts', range],
    queryFn: async () => {
      const since = new Date(Date.now() - RANGES[range] * 864e5).toISOString().slice(0, 10);
      const { data } = await supabase.from('workouts').select('*').gte('date', since).order('date', { ascending: false });
      return data ?? [];
    },
  });

  const total = (data ?? []).reduce((s, w) => s + Number(w.distance_km), 0);

  return (
    <Screen>
      <header className="flex items-center justify-between pb-4">
        <h1 className="text-[22px]">Entrenamientos</h1>
        <IconButton onClick={() => nav('/entrenos/nuevo')} aria-label="Nueva salida" className="h-[38px] w-[38px]">
          <Plus size={18} />
        </IconButton>
      </header>

      <div className="flex flex-col gap-4">
        <Segmented options={Object.keys(RANGES)} value={range} onChange={setRange} />

        <div className="flex justify-between rounded bg-card px-4 py-3.5 shadow-hairline">
          <span className="flex flex-col gap-0.5">
            <Label>{range}</Label>
            <span className="num text-[17px] font-medium">{total.toFixed(1).replace('.', ',')} km</span>
          </span>
          <span className="flex flex-col items-end gap-0.5">
            <Label>Salidas</Label>
            <span className="num text-[17px] font-medium">{data?.length ?? 0}</span>
          </span>
        </div>

        {isLoading && <div className="flex flex-col gap-2">{[0,1,2,3].map((i) => <Skeleton key={i} className="h-16" />)}</div>}

        {!isLoading && data?.length === 0 && (
          <EmptyState title="Sin salidas en este período" body="Probá con otro rango, o cargá la salida de hoy." />
        )}

        <ul className="m-0 flex list-none flex-col p-0">
          {(data ?? []).map((w, i, arr) => (
            <li key={w.id} className={'flex items-center gap-3.5 px-1 py-3.5' + (i < arr.length - 1 ? ' border-b border-rail' : '')}>
              <span className="h-9 w-[3px] shrink-0 rounded-sm" style={{ background: markColor(w) }} />
              <span className="flex flex-1 flex-col gap-[3px]">
                <span className={'num text-[15px]' + (w.is_pr ? ' font-medium' : '')}>
                  {fmtDistance(w.distance_km)} km · {fmtDuration(w.duration_s)}
                </span>
                <span className="text-xs text-neutral-600">
                  {new Date(w.date + 'T12:00').toLocaleDateString('es-AR', { weekday: 'long' })} · {typeLabel(w.type)}
                  {w.is_pr && ' · PR'}
                  {w.discomfort !== 'none' && ` · molestia ${w.discomfort}`}
                </span>
              </span>
              <span className="num text-sm text-neutral-400">{fmtPace(paceFrom(w.distance_km, w.duration_s))}</span>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}

function markColor(w) {
  if (w.is_pr) return '#9184d9';
  if (w.discomfort && w.discomfort !== 'none') return '#df9f6f';
  return '#595d6c';
}

function typeLabel(t) {
  return { continuous: 'Continuo', easy: 'Suave', intervals: 'Series', long: 'Fondo' }[t] ?? t;
}
