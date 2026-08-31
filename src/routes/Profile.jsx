import { useState } from 'react';
import { CaretLeft, PencilSimple } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { useSession } from '../store/session';
import { Screen } from '../components/Screen';
import { Button, Chip, Label, Option, ScreenTitle, Switch } from '../components/ui';
import { initials } from '../lib/format';

/* Las mismas opciones que el onboarding: el perfil es donde se rehace esa
   decisión, así que la lista tiene que ser idéntica. */
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

const labelOf = (list, key) => list.find((o) => o.key === key)?.title ?? '—';

export default function Profile() {
  const { profile, loadProfile, signOut } = useSession();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const name = profile?.display_name ?? 'Sin nombre';

  async function toggle(key, value) {
    setSaving(true);
    await supabase.from('profiles').update({ [key]: value }).eq('id', profile.id);
    await loadProfile();
    setSaving(false);
  }

  if (editing) return <EditGoals profile={profile} onDone={() => setEditing(false)} />;

  return (
    <Screen>
      <header className="flex items-center gap-4 pb-[18px]">
        <div className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-surface text-[22px] font-medium text-neutral-400 shadow-edge">
          {initials(name)}
        </div>
        <div className="flex flex-1 flex-col gap-[3px]">
          <span className="text-[21px] font-medium tracking-[-.02em]">{name}</span>
          <span className="text-sm text-neutral-600">
            {profile?.birth_year ? `${new Date().getFullYear() - profile.birth_year} años` : '—'} · {labelOf(LEVELS, profile?.level)}
            {profile?.city ? ` · ${profile.city}` : ''}
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-[18px]">
        {/* El objetivo se define en el onboarding, que corre una sola vez.
            Sin esta sección no hay forma de volver a cambiarlo. */}
        <section className="flex flex-col gap-2.5">
          <Label>Tu perfil de corredor</Label>
          <div className="flex flex-col gap-px overflow-hidden rounded shadow-hairline">
            <Field k="Objetivo" v={labelOf(GOALS, profile?.goal)} />
            <Field k="Nivel" v={labelOf(LEVELS, profile?.level)} />
            <Field k="Distancia habitual" v={profile?.usual_distance_km ? `${Number(profile.usual_distance_km)} km` : '—'} />
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex h-11 items-center justify-center gap-2 rounded text-[15px] font-medium text-accent shadow-edge transition-colors duration-150 hover:bg-accent/[.08] active:bg-accent/[.14]"
          >
            <PencilSimple size={17} />
            Cambiar objetivo y nivel
          </button>
          <p className="m-0 text-[13px] leading-relaxed text-neutral-600" style={{ textWrap: 'pretty' }}>
            El Run Score usa tu nivel para saber cuántas salidas esperar de vos.
            Cambiarlo ajusta el cálculo desde el próximo entrenamiento.
          </p>
        </section>

        <section className="flex flex-col gap-2.5">
          <Label>Privacidad</Label>
          <div className="flex flex-col gap-px overflow-hidden rounded shadow-hairline" aria-busy={saving}>
            <Switch label="Perfil público" description="Otros ven tus salidas y logros"
              checked={!!profile?.is_public} onChange={(v) => toggle('is_public', v)} />
            <Switch label="Mostrar mi ciudad" description="Necesario para el ranking por ciudad"
              checked={!!profile?.show_city} onChange={(v) => toggle('show_city', v)} />
            <Switch label="Aparecer en rankings" description="Podés competir sin figurar"
              checked={!!profile?.in_rankings} onChange={(v) => toggle('in_rankings', v)} />
          </div>
        </section>

        <button onClick={signOut} className="flex h-12 items-center justify-center text-[15px] text-neutral-500">
          Cerrar sesión
        </button>
      </div>
    </Screen>
  );
}

function Field({ k, v }) {
  return (
    <div className="flex items-center justify-between bg-card px-4 py-[15px]">
      <span className="text-[15px] text-neutral-500">{k}</span>
      <span className="text-[15px]">{v}</span>
    </div>
  );
}

/* Edición en una sola pantalla, no los cuatro pasos del onboarding: acá el
   usuario ya sabe qué está cambiando y viene a tocar una cosa puntual. */
function EditGoals({ profile, onDone }) {
  const { loadProfile } = useSession();
  const year = new Date().getFullYear();
  const [goal, setGoal] = useState(profile?.goal ?? null);
  const [level, setLevel] = useState(profile?.level ?? null);
  const [distance, setDistance] = useState(profile?.usual_distance_km ? Number(profile.usual_distance_km) : null);
  const [age, setAge] = useState(profile?.birth_year ? year - profile.birth_year : 34);
  const [name, setName] = useState(profile?.display_name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: name.trim() || null,
      city: city.trim() || null,
      birth_year: year - age,
      level, goal,
      usual_distance_km: distance,
    }).eq('id', profile.id);
    await loadProfile();
    setSaving(false);
    onDone();
  }

  return (
    <Screen wide>
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-center gap-3.5">
          <button onClick={onDone} className="text-neutral-400" aria-label="Volver">
            <CaretLeft size={20} />
          </button>
          <span className="text-[15px] text-neutral-500">Perfil</span>
        </div>
        <ScreenTitle help="Cambiá lo que necesites. Se aplica al próximo cálculo.">
          Tu perfil de corredor
        </ScreenTitle>
      </div>

      <div className="flex flex-1 flex-col gap-6 py-6">
        <section className="flex flex-col gap-2.5">
          <Label>Nombre y ciudad</Label>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre" maxLength={40}
            className="h-12 rounded bg-option px-4 text-[15px] shadow-edge placeholder:text-neutral-700"
          />
          <input
            value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="Ciudad" maxLength={60}
            className="h-12 rounded bg-option px-4 text-[15px] shadow-edge placeholder:text-neutral-700"
          />
        </section>

        <section className="flex flex-col gap-2.5">
          <Label>Objetivo</Label>
          {GOALS.map((g) => (
            <Option key={g.key} title={g.title} selected={goal === g.key} onClick={() => setGoal(g.key)} />
          ))}
        </section>

        <section className="flex flex-col gap-2.5">
          <Label>Nivel</Label>
          {LEVELS.map((l) => (
            <Option key={l.key} {...l} selected={level === l.key} onClick={() => setLevel(l.key)} />
          ))}
        </section>

        <section className="flex flex-col gap-2.5">
          <Label>Distancia habitual</Label>
          <div className="flex flex-wrap gap-2.5">
            {DISTANCES.map((d) => (
              <Chip key={d} selected={distance === d} className="min-h-[44px]"
                onClick={() => setDistance(d)}>
                <span className="num">{d === 15 ? '15+' : d} km</span>
              </Chip>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <Label>Edad</Label>
          <div className="flex items-baseline gap-2">
            <span className="num text-[40px] font-semibold leading-none tracking-[-.04em]">{age}</span>
            <span className="text-[15px] text-neutral-600">años · categoría {category(age)}</span>
          </div>
          <input
            type="range" min={14} max={80} value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="h-8 w-full accent-accent"
          />
        </section>
      </div>

      <Button disabled={saving || !goal || !level || !distance} onClick={save}>
        {saving ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </Screen>
  );
}

function category(age) {
  const lo = Math.floor(age / 10) * 10;
  return `${lo}–${lo + 9}`;
}
