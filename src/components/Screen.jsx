import { clsx } from '../lib/clsx';

/** Shell de pantalla. Padding lateral 20px (24 en bienvenidas), 70px arriba
 *  para la status bar y 46 abajo para el home indicator. */
export function Screen({ wide = false, gradient = false, className, children }) {
  return (
    <div
      className={clsx(
        'mx-auto flex min-h-dvh w-full max-w-[520px] flex-col safe-top safe-bottom',
        wide ? 'px-6' : 'px-5',
        gradient && 'bg-[radial-gradient(120%_70%_at_50%_0%,#241f3d_0%,#161826_55%,#131421_100%)]',
        className
      )}
    >
      {children}
    </div>
  );
}
