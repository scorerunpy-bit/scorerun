import { Screen } from '../components/Screen';
import { EmptyState } from '../components/ui';

export function Placeholder({ title, note }) {
  return (
    <Screen>
      <h1 className="pb-4 text-[22px]">{title}</h1>
      <EmptyState title="Pendiente de implementar" body={note} />
    </Screen>
  );
}
