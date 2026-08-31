import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from '../store/session';
import { Screen } from '../components/Screen';
import { Label, Switch } from '../components/ui';
import { initials } from '../lib/format';

export default function Profile() {
  const { profile, loadProfile, signOut } = useSession();
  const [saving, setSaving] = useState(false);
  const name = profile?.display_name ?? 'Sin nombre';

  async function toggle(key, value) {
    setSaving(true);
    await supabase.from('profiles').update({ [key]: value }).eq('id', profile.id);
    await loadProfile();
    setSaving(false);
  }

  return (
    <Screen>
      <header className="flex items-center gap-4 pb-[18px]">
        <div className="flex h-[66px] w-[66px] items-center justify-center rounded-full bg-surface text-[22px] font-medium text-neutral-400 shadow-edge">
          {initials(name)}
        </div>
        <div className="flex flex-1 flex-col gap-[3px]">
          <span className="text-[21px] font-medium tracking-[-.02em]">{name}</span>
          <span className="text-sm text-neutral-600">
            {profile?.birth_year ? `${new Date().getFullYear() - profile.birth_year} años` : '—'} · {profile?.level ?? '—'}
            {profile?.city ? ` · ${profile.city}` : ''}
          </span>
        </div>
        <button className="text-[13px] font-medium text-accent">Editar</button>
      </header>

      <div className="flex flex-col gap-[18px]">
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
