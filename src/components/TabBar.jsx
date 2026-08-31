import { NavLink } from 'react-router-dom';
import { House, Sneaker, Trophy, UsersThree, User } from '@phosphor-icons/react';
import { clsx } from '../lib/clsx';

/* Cinco destinos, fijos. El activo se marca con color de acento, no con relleno.
   Los emojis del brief están traducidos a íconos Phosphor: nada de emojis en producción. */
const TABS = [
  { to: '/', label: 'Inicio', Icon: House },
  { to: '/entrenos', label: 'Entrenos', Icon: Sneaker },
  { to: '/challenges', label: 'Challenges', Icon: Trophy },
  { to: '/social', label: 'Social', Icon: UsersThree },
  { to: '/perfil', label: 'Perfil', Icon: User },
];

export default function TabBar() {
  return (
    <nav className="sticky bottom-0 -mx-5 flex border-t border-rail bg-card px-2 pb-[max(30px,env(safe-area-inset-bottom))] pt-[10px]">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className="flex flex-1 flex-col items-center gap-[5px]">
          {({ isActive }) => (
            <>
              <Icon size={24} weight="regular" className={isActive ? 'text-accent-400' : 'text-neutral-600'} />
              <span className={clsx('text-[10px]', isActive ? 'font-medium text-accent-400' : 'text-neutral-600')}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
