import { useQuery } from '@tanstack/react-query';
import { Lock, Trophy } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { Screen } from '../components/Screen';
import { Label, Meter, Skeleton } from '../components/ui';

export default function Achievements() {
  const { data, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await supabase.from('achievements')
        .select('*, user_achievements(unlocked_at, progress)').order('sort_order');
      return data ?? [];
    },
  });

  if (isLoading) return <Screen><Skeleton className="h-[400px]" /></Screen>;

  const unlocked = data.filter((a) => a.user_achievements?.[0]?.unlocked_at).length;

  return (
    <Screen>
      <header className="flex flex-col gap-1.5 pb-4">
        <h1 className="text-[22px]">Logros</h1>
        <span className="text-sm text-neutral-600">{unlocked} de {data.length} desbloqueados</span>
      </header>

      <div className="flex flex-col gap-[18px]">
        <Meter pct={data.length ? (unlocked / data.length) * 100 : 0} />
        <div className="grid grid-cols-3 gap-2.5">
          {data.map((a) => {
            const ua = a.user_achievements?.[0];
            const state = ua?.unlocked_at ? 'unlocked' : ua ? 'available' : 'locked';
            return <Badge key={a.id} title={a.name} state={state} />;
          })}
        </div>
      </div>
    </Screen>
  );
}

function Badge({ title, state }) {
  const styles = {
    unlocked: 'bg-[linear-gradient(150deg,#252042,#1a1c29)] shadow-[0_0_0_1px_#423a6a] text-accent-on',
    available: 'bg-card shadow-hairline text-neutral-400',
    locked: 'bg-card shadow-hairline text-neutral-600 opacity-50',
  }[state];
  const Icon = state === 'locked' ? Lock : Trophy;
  return (
    <div className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-lg p-2.5 ${styles}`}>
      <Icon size={28} className={state === 'unlocked' ? 'text-accent-400' : undefined} />
      <span className="text-center text-[11px] leading-[1.3]">{title}</span>
    </div>
  );
}
