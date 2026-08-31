import { clsx } from '../lib/clsx';

/* ── Botones ────────────────────────────────────────────────
   El primario es CONTORNO (1px de acento sobre transparente), nunca relleno.
   Alto 52px: objetivo táctil por encima del mínimo de 44. */
export function Button({ variant = 'primary', className, children, ...props }) {
  const base = 'h-[52px] w-full rounded inline-flex items-center justify-center gap-2 ' +
    'text-base font-medium transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed';
  const variants = {
    primary: 'border border-accent text-accent-on hover:bg-accent/10 active:bg-accent/20',
    secondary: 'border border-neutral-800 text-text hover:border-neutral-700',
    ghost: 'text-neutral-400 hover:text-text',
  };
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function IconButton({ className, children, ...props }) {
  return (
    <button
      className={clsx(
        'h-[44px] w-[44px] rounded border border-accent text-accent',
        'inline-flex items-center justify-center transition-colors duration-150 hover:bg-accent/10',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Superficies ───────────────────────────────────────────
   Elevación en fondo oscuro = borde hairline + oscuridad ambiental.
   No apilar sombras. */
export function Card({ inner = false, className, children, ...props }) {
  return (
    <div
      className={clsx(
        'rounded p-4',
        inner ? 'bg-card shadow-hairline' : 'bg-surface shadow-card rounded-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Label({ className, children }) {
  return (
    <span className={clsx('text-[11px] font-semibold uppercase tracking-[.12em] text-neutral-600', className)}>
      {children}
    </span>
  );
}

export function ScreenTitle({ children, help }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-[28px] leading-[1.15]">{children}</h1>
      {help && <p className="m-0 text-[15px] text-neutral-600">{help}</p>}
    </div>
  );
}

/* ── Opciones (una decisión por paso) ───────────────────── */
export function Option({ selected, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative flex min-h-[60px] w-full flex-col justify-center gap-[3px] rounded px-4 py-3 text-left',
        'transition-colors duration-150',
        selected
          ? 'bg-accent/[.12] shadow-[0_0_0_1px_#9184d9]'
          : 'bg-option shadow-edge hover:shadow-[0_0_0_1px_#595d6c]'
      )}
    >
      <span className={clsx('text-base', selected && 'font-medium')}>{title}</span>
      {description && (
        <span className={clsx('text-[13px]', selected ? 'text-neutral-400' : 'text-neutral-600')}>
          {description}
        </span>
      )}
      {selected && <Check className="absolute right-4 top-4" />}
    </button>
  );
}

function Check({ className }) {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" fill="none" className={clsx('text-accent-400', className)}>
      <circle cx="9" cy="9" r="8" fill="rgb(145 132 217 / .25)" />
      <path d="M5.3 9.2l2.4 2.4 5-5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chip({ selected, tone = 'accent', className, children, ...props }) {
  const tones = {
    accent: 'bg-accent/[.12] shadow-[0_0_0_1px_#9184d9] text-accent-on',
    good: 'bg-score-excellent/[.12] shadow-[0_0_0_1px_rgba(111,199,159,.55)] text-score-excellent',
  };
  return (
    <button
      className={clsx(
        'rounded px-4 py-[11px] text-sm transition-colors duration-150',
        selected ? tones[tone] : 'bg-card text-neutral-400 shadow-edge hover:text-text',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Segmented({ options, value, onChange }) {
  return (
    <div className="flex gap-[2px] rounded bg-card p-[3px] shadow-hairline">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={clsx(
            'flex-1 rounded-sm py-[9px] text-[13px] transition-colors duration-150',
            value === o ? 'bg-surface font-medium text-text' : 'text-neutral-600 hover:text-neutral-400'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label, description }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex w-full items-center justify-between bg-card px-4 py-[15px] text-left">
      <span className="flex flex-col gap-[2px]">
        <span className="text-[15px]">{label}</span>
        {description && <span className="text-xs text-neutral-600">{description}</span>}
      </span>
      <span
        className={clsx(
          'relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-150',
          checked ? 'bg-accent/30 shadow-[inset_0_0_0_1px_#9184d9]' : 'bg-rail shadow-[inset_0_0_0_1px_#3f424d]'
        )}
      >
        <span
          className={clsx(
            'absolute top-[3px] h-5 w-5 rounded-full transition-all duration-150',
            checked ? 'right-[3px] bg-accent-on' : 'left-[3px] bg-neutral-600'
          )}
        />
      </span>
    </button>
  );
}

/* ── Progreso ──────────────────────────────────────────── */
export function StepBar({ total, current }) {
  return (
    <div className="flex flex-1 gap-[5px]">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={clsx('h-[3px] flex-1 rounded-sm', i < current ? 'bg-accent' : 'bg-rail')} />
      ))}
    </div>
  );
}

export function Meter({ pct, color = '#9184d9' }) {
  return (
    <div className="h-1 overflow-hidden rounded-sm bg-rail">
      <div className="h-full rounded-sm transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ── Estados de carga y vacío ─────────────────────────────
   Skeleton con el mismo alto que la fila real, nunca un spinner centrado. */
export function Skeleton({ className }) {
  return (
    <div
      className={clsx(
        'animate-shimmer rounded bg-[linear-gradient(90deg,#1a1c29_25%,#232532_50%,#1a1c29_75%)] bg-[length:200%_100%]',
        className
      )}
    />
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded bg-card p-5 shadow-hairline">
      <span className="text-[17px] font-medium">{title}</span>
      <p className="m-0 text-[15px] leading-relaxed text-neutral-400" style={{ textWrap: 'pretty' }}>{body}</p>
      {action}
    </div>
  );
}

export function ErrorBanner({ children, onRetry }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 rounded bg-score-rest/[.12] px-4 py-2 shadow-[0_0_0_1px_rgba(221,139,139,.5)]">
      <span className="text-sm text-score-rest">{children}</span>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium text-score-rest underline">
          Reintentar
        </button>
      )}
    </div>
  );
}
