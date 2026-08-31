import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { Screen } from '../components/Screen';
import { Button, Chip, ErrorBanner, Label } from '../components/ui';
import { fmtPace, parseDuration } from '../lib/format';

const TYPES = [
  { key: 'continuous', label: 'Continuo' },
  { key: 'easy', label: 'Suave' },
  { key: 'intervals', label: 'Series' },
  { key: 'long', label: 'Fondo' },
];
const DISCOMFORT = [
  { key: 'none', label: 'Ninguna' },
  { key: 'mild', label: 'Leve' },
  { key: 'moderate', label: 'Media' },
  { key: 'severe', label: 'Fuerte' },
];

export default function NewWorkout() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState('continuous');
  const [rpe, setRpe] = useState(5);
  const [discomfort, setDiscomfort] = useState('none');
  const [advanced, setAdvanced] = useState(false);
  const [hrAvg, setHrAvg] = useState('');
  const [hrMax, setHrMax] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const km = Number(String(distance).replace(',', '.'));
  const seconds = parseDuration(duration);
  // el ritmo se DERIVA, nunca se pide
  const pace = useMemo(() => (km > 0 && seconds > 0 ? seconds / km : null), [km, seconds]);
  const valid = km >= 0.1 && km <= 100 && seconds > 0;

  async function save() {
    setBusy(true); setError(null);
    const { error } = await supabase.from('workouts').insert({
      date: new Date().toISOString().slice(0, 10),
      distance_km: km, duration_s: seconds, type, rpe, discomfort,
      hr_avg: hrAvg ? Number(hrAvg) : null,
      hr_max: hrMax ? Number(hrMax) : null,
    });
    if (error) { setError(error.message); setBusy(false); return; }
    // recalcular el Score del lado del servidor y volver a Home con el número nuevo
    await supabase.functions.invoke('compute-score');
    await qc.invalidateQueries();
    nav('/');
  }

  return (
    <Screen>
      <header className="flex items-center gap-3 pb-[18px]">
        <button onClick={() => nav(-1)} className="text-neutral-400" aria-label="Cerrar"><X size={20} /></button>
        <span className="flex-1 text-base font-medium">Nueva salida</span>
        <span className="text-[13px] text-neutral-600">Hoy</span>
      </header>

      <div className="flex flex-col gap-[18px]">
        {error && <ErrorBanner onRetry={save}>{error}</ErrorBanner>}

        <div className="flex gap-3">
          <Field label="Distancia" unit="km">
            <input inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="5,02"
              className="num w-full bg-transparent text-3xl font-medium outline-none placeholder:text-neutral-700" />
          </Field>
          <Field label="Tiempo">
            <input inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="22:45"
              className="num w-full bg-transparent text-3xl font-medium outline-none placeholder:text-neutral-700" />
          </Field>
        </div>

        <div className="flex items-center justify-between rounded bg-accent/[.09] px-4 py-3.5 shadow-[0_0_0_1px_#423a6a]">
          <span className="text-sm text-neutral-300">Ritmo calculado</span>
          <span className="num text-[17px] font-medium text-accent-300">{pace ? `${fmtPace(pace)} /km` : '—'}</span>
        </div>

        <section className="flex flex-col gap-2.5">
          <Label>Tipo de salida</Label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Chip key={t.key} selected={type === t.key} onClick={() => setType(t.key)}>{t.label}</Chip>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <Label>Esfuerzo percibido</Label>
            <span className="text-sm text-neutral-300">{rpe} · {rpeWord(rpe)}</span>
          </div>
          <div className="flex h-11 items-end gap-[5px]">
            {Array.from({ length: 10 }, (_, i) => (
              <button key={i} onClick={() => setRpe(i + 1)} aria-label={`RPE ${i + 1}`}
                className="flex-1 rounded-sm transition-colors duration-150"
                style={{ height: `${22 + i * 8.7}%`, background: rpe === i + 1 ? '#9184d9' : '#2f3240' }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-neutral-600"><span>Muy fácil</span><span>Al límite</span></div>
        </section>

        <section className="flex flex-col gap-2.5">
          <Label>¿Alguna molestia?</Label>
          <div className="flex gap-2">
            {DISCOMFORT.map((d) => (
              <Chip key={d.key} selected={discomfort === d.key} tone={d.key === 'none' ? 'good' : 'accent'}
                onClick={() => setDiscomfort(d.key)} className="flex-1">{d.label}</Chip>
            ))}
          </div>
        </section>

        {advanced ? (
          <div className="flex gap-3">
            <Field label="FC promedio"><input inputMode="numeric" value={hrAvg} onChange={(e) => setHrAvg(e.target.value)} placeholder="148"
              className="num w-full bg-transparent text-2xl font-medium outline-none placeholder:text-neutral-700" /></Field>
            <Field label="FC máxima"><input inputMode="numeric" value={hrMax} onChange={(e) => setHrMax(e.target.value)} placeholder="172"
              className="num w-full bg-transparent text-2xl font-medium outline-none placeholder:text-neutral-700" /></Field>
          </div>
        ) : (
          <button onClick={() => setAdvanced(true)} className="flex h-11 items-center justify-center gap-1.5 text-sm text-neutral-400">
            <Plus size={15} /> Agregar frecuencia cardíaca
          </button>
        )}
      </div>

      <div className="mt-auto pt-6">
        <Button disabled={!valid || busy} onClick={save}>{busy ? 'Guardando…' : 'Guardar salida'}</Button>
      </div>
    </Screen>
  );
}

function Field({ label, unit, children }) {
  return (
    <label className="flex flex-1 flex-col gap-1.5 rounded bg-card p-4 shadow-edge">
      <Label>{label}</Label>
      <span className="flex items-baseline gap-1.5">
        {children}
        {unit && <span className="text-sm text-neutral-600">{unit}</span>}
      </span>
    </label>
  );
}

function rpeWord(n) {
  if (n <= 2) return 'muy fácil';
  if (n <= 4) return 'cómodo';
  if (n <= 6) return 'moderado';
  if (n <= 8) return 'exigente';
  return 'al límite';
}
