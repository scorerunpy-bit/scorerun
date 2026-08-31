import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useSession } from '../store/session';
import { Screen } from '../components/Screen';
import { Button, ErrorBanner, Label } from '../components/ui';
import Wordmark from '../components/Wordmark';

export default function Login() {
  const { signIn, signUp } = useSession();
  const [mode, setMode] = useState('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError(null);
    const fn = mode === 'in' ? signIn : signUp;
    const { error } = await fn(email, password);
    if (error) setError(error.message);
    setBusy(false);
  }

  return (
    <Screen wide gradient>
      <form onSubmit={submit} className="flex flex-1 flex-col justify-center gap-6">
        <Wordmark size={26} />
        <h1 className="text-[32px] leading-[1.1] tracking-[-.03em]">
          {mode === 'in' ? <>Entrá a tu<br />carrera</> : <>Creá tu<br />cuenta</>}
        </h1>

        {error && <ErrorBanner>{error}</ErrorBanner>}

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-[7px]">
            <Label className="tracking-[.1em]">Email</Label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="vos@mail.com" autoComplete="email"
              className="h-[50px] rounded bg-card px-[15px] text-[15px] text-text shadow-edge outline-none placeholder:text-neutral-700 focus:shadow-[0_0_0_1px_#9184d9]"
            />
          </label>
          <label className="flex flex-col gap-[7px]">
            <Label className="tracking-[.1em]">Contraseña</Label>
            <div className="relative">
              <input
                type={reveal ? 'text' : 'password'} required minLength={8} value={password}
                onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
                className="h-[50px] w-full rounded bg-card px-[15px] pr-12 text-[15px] tracking-[.22em] text-text shadow-edge outline-none focus:shadow-[0_0_0_1px_#9184d9]"
              />
              <button type="button" onClick={() => setReveal(!reveal)} aria-label="Mostrar contraseña"
                className="absolute right-[15px] top-1/2 -translate-y-1/2 text-neutral-600">
                {reveal ? <EyeSlash size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>
          {mode === 'in' && <button type="button" className="self-start text-sm text-accent">¿Olvidaste tu contraseña?</button>}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <Button type="submit" onClick={submit} disabled={busy}>
          {busy ? 'Un segundo…' : mode === 'in' ? 'Entrar' : 'Crear cuenta'}
        </Button>
        <button onClick={() => setMode(mode === 'in' ? 'up' : 'in')} className="flex h-[52px] items-center justify-center gap-1.5 text-[15px] text-neutral-400">
          {mode === 'in' ? <>¿No tenés cuenta? <span className="font-medium text-accent">Creá una</span></>
                         : <>¿Ya tenés cuenta? <span className="font-medium text-accent">Entrá</span></>}
        </button>
      </div>
    </Screen>
  );
}
