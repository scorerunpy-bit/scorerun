import { useEffect, useState } from 'react';
import { CaretLeft } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { useSession } from '../store/session';
import { Screen } from '../components/Screen';
import { Button, Option, ScreenTitle, StepBar } from '../components/ui';

const GOALS = [
  { key: 'start', title: 'Empezar a correr' },
  { key: '5k', title: 'Mejorar mi 5K' },
  { key: '10k', title: 'Mejorar mi 10K' },
  { key: 'distance', title: 'Aumentar distancia' },
  { key: 'frequency', title: 'Correr más seguido' },
];

const LEVELS = [
  { key: 'beginner', title: 'Principiante', description: 'Estoy arrancando o volviendo' },
  { key: 'amateur', title: 'Amateur', description: 'Corro seguido, ya hice un 5K' },
  { key: 'recreational', title: 'Recreativo', description: 'Corro por salud, sin objetivos de tiempo' },
  { key: 'competitive', title: 'Competitivo', description: 'Entreno para mejorar marcas' },
];

const DISTANCES = [3, 5, 8, 10, 15];
const STORAGE_KEY = 'scorerun.onboarding';

export default function Onboarding() {
  const { session, loadProfile } = useSession();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; } catch { return {}; }
  });
  const [saving, setSaving] = useState(false);

  // el paso sobrevive un refresh: el onboarding no se pierde a mitad de camino
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); }, [answers]);

  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }));
  const age = answers.age ?? 34;

  async function finish() {
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: session.user.id,
      birth_year: new Date().getFullYear() - age,
      level: answers.level,
      goal: answers.goal,
      usual_distance_km: answers.distance,
    });
    localStorage.removeItem(STORAGE_KEY);
    await loadProfile();
  }

  if (step === 4) return <Done name={answers.name} answers={answers} age={age} onFinish={finish} saving={saving} />;

  const steps = [
    {
      title: '¿Qué querés lograr?', help: 'Elegí uno. Después lo podés cambiar.',
      valid: !!answers.goal,
      body: GOALS.map((g) => (
        <Option key={g.key} title={g.title} selected={answers.goal === g.key} onClick={() => set({ goal: g.key })} />
      )),
    },
    {
      title: '¿Cuántos años tenés?', help: 'Lo usamos para tu categoría y tus rankings.',
      valid: true,
      body: (
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="flex items-end gap-2">
            <span className="num text-[112px] font-semibold leading-[.85] tracking-[-.05em]">{age}</span>
            <span className="pb-3.5 text-[19px] text-neutral-600">años</span>
          </div>
          <div className="flex w-full flex-col gap-3">
            <input
              type="range" min={14} max={80} value={age}
              onChange={(e) => set({ age: Number(e.target.value) })}
              className="h-8 w-full accent-accent"
            />
            <div className="num flex justify-between text-xs text-neutral-600">
              <span>14</span><span>Categoría {category(age)}</span><span>80</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '¿Cómo te definís hoy?', help: 'Sin vueltas: elegí lo que más se parezca.',
      valid: !!answers.level,
      body: LEVELS.map((l) => (
        <Option key={l.key} {...l} selected={answers.level === l.key} onClick={() => set({ level: l.key })} />
      )),
    },
    {
      title: '¿Cuánto corrés normalmente?', help: 'Tu salida típica, no tu mejor día.',
      valid: !!answers.distance,
      body: (
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-3 gap-2.5">
            {DISTANCES.slice(0, 3).map((d) => <DistanceChip key={d} d={d} answers={answers} set={set} />)}
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {DISTANCES.slice(3).map((d) => <DistanceChip key={d} d={d} answers={answers} set={set} />)}
          </div>
        </div>
      ),
    },
  ];

  const s = steps[step];

  return (
    <Screen wide>
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-center gap-3.5">
          <button onClick={() => setStep(Math.max(0, step - 1))} className="text-neutral-400" aria-label="Atrás">
            <CaretLeft size={20} />
          </button>
          <StepBar total={4} current={step + 1} />
          <span className="num text-xs text-neutral-600">{step + 1}/4</span>
        </div>
        <ScreenTitle help={s.help}>{s.title}</ScreenTitle>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 py-6">{s.body}</div>

      <Button disabled={!s.valid} onClick={() => setStep(step + 1)}>
        {step === 3 ? 'Listo' : 'Continuar'}
      </Button>
    </Screen>
  );
}

function DistanceChip({ d, answers, set }) {
  const selected = answers.distance === d;
  return (
    <button
      onClick={() => set({ distance: d })}
      className={
        'flex h-[76px] flex-col items-center justify-center gap-0.5 rounded transition-colors duration-150 ' +
        (selected ? 'bg-accent/[.12] shadow-[0_0_0_1px_#9184d9]' : 'bg-option shadow-edge')
      }
    >
      <span className={'num text-[22px] ' + (selected ? 'font-semibold text-accent-on' : 'font-medium')}>
        {d === 15 ? '15+' : d}
      </span>
      <span className={'text-xs ' + (selected ? 'text-accent-400' : 'text-neutral-600')}>km</span>
    </button>
  );
}

function Done({ answers, age, onFinish, saving }) {
  return (
    <Screen wide gradient>
      <div className="flex flex-1 flex-col items-start justify-center gap-[26px]">
        <div className="relative flex h-[120px] w-[120px] items-center justify-center">
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-[radial-gradient(circle,rgba(145,132,217,.28),transparent_68%)]" />
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="52" stroke="#2f3240" strokeWidth="4" />
            <circle cx="60" cy="60" r="52" stroke="#9184d9" strokeWidth="4" strokeLinecap="round"
              strokeDasharray="327" strokeDashoffset="242" transform="rotate(-90 60 60)" />
          </svg>
          <span className="absolute text-[15px] font-medium text-accent-400">Listo</span>
        </div>
        <h1 className="text-4xl leading-[1.1] tracking-[-.03em]">Todo listo.</h1>
        <p className="m-0 max-w-[310px] text-[17px] leading-[1.5] text-neutral-400" style={{ textWrap: 'pretty' }}>
          Tu Run Score se calcula con tu primera salida cargada. Son cuatro campos y treinta segundos.
        </p>
        <dl className="m-0 flex w-full flex-col gap-2.5">
          <Row k="Objetivo" v={label(answers.goal, 'goal')} />
          <Row k="Nivel" v={`${label(answers.level, 'level')} · ${age} años`} />
          <Row k="Distancia habitual" v={`${answers.distance} km`} last />
        </dl>
      </div>
      <Button onClick={onFinish} disabled={saving}>
        {saving ? 'Guardando…' : 'Registrar mi primera salida'}
      </Button>
    </Screen>
  );
}

function Row({ k, v, last }) {
  return (
    <div className={'flex justify-between py-3 text-[15px]' + (last ? '' : ' border-b border-rail')}>
      <dt className="text-neutral-600">{k}</dt>
      <dd className="m-0">{v}</dd>
    </div>
  );
}

function label(key, kind) {
  const src = kind === 'goal' ? GOALS : LEVELS;
  return src.find((o) => o.key === key)?.title ?? '—';
}

function category(age) {
  const lo = Math.floor(age / 10) * 10;
  return `${lo}–${lo + 9}`;
}
