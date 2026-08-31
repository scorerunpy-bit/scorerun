import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { configured, configDiagnosis } from './lib/supabase';
import { useSession } from './store/session';
import TabBar from './components/TabBar';
import Login from './routes/Login';
import Onboarding from './routes/Onboarding';
import Home from './routes/Home';
import NewWorkout from './routes/NewWorkout';
import History from './routes/History';
import Progress from './routes/Progress';
import Achievements from './routes/Achievements';
import Coach from './routes/Coach';
import Profile from './routes/Profile';
import { Placeholder } from './routes/Placeholder';

function Setup() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[520px] flex-col justify-center gap-5 px-6">
      <span className="text-[11px] font-semibold uppercase tracking-[.14em] text-neutral-600">
        Falta un paso
      </span>
      <h1 className="text-[28px]">Conectá Supabase</h1>
      <p className="m-0 text-[15px] leading-relaxed text-neutral-400" style={{ textWrap: 'pretty' }}>
        Abrí <code className="text-accent-300">public/config.js</code> en tu repositorio y pegá
        los dos valores que están en Supabase, en Project Settings → API.
      </p>
      <pre className="m-0 overflow-x-auto rounded bg-card p-4 text-[13px] leading-relaxed text-neutral-300 shadow-hairline">
{`window.__SCORERUN_CONFIG = {
  url: 'https://xxxx.supabase.co',
  anonKey: 'eyJhbGci...',
};`}
      </pre>
      <div className="flex flex-col gap-2 rounded bg-card p-4 shadow-hairline">
        <span className="text-[11px] font-semibold uppercase tracking-[.12em] text-neutral-600">
          Lo que la app está leyendo
        </span>
        <Row ok={configDiagnosis.urlOk} label="URL" value={configDiagnosis.url || 'vacía'} />
        <Row ok={configDiagnosis.keyOk} label="Anon key"
             value={configDiagnosis.keyPreview || 'vacía'} />
        <span className="text-xs text-neutral-700">Origen: {configDiagnosis.source}</span>
      </div>
      <p className="m-0 text-[13px] leading-relaxed text-neutral-600" style={{ textWrap: 'pretty' }}>
        Va la <strong className="font-medium text-neutral-400">anon public key</strong> (arranca con
        <code className="text-accent-300"> eyJ</code>), nunca la service_role.
      </p>
    </div>
  );
}

function Row({ ok, label, value }) {
  return (
    <div className="flex items-baseline gap-2.5 text-[13px]">
      <span className="h-3 w-[3px] shrink-0 translate-y-0.5 rounded-sm"
            style={{ background: ok ? '#6fc79f' : '#dd8b8b' }} />
      <span className="w-[68px] shrink-0 text-neutral-600">{label}</span>
      <span className="break-all text-neutral-300">{value}</span>
    </div>
  );
}

/* La tab bar solo vive en las pantallas raíz. Onboarding, acceso, registro,
   compartir, detalle de challenge, resultado y coach son modales o push de pila. */
const ROOTS = ['/', '/entrenos', '/challenges', '/social', '/perfil'];

export default function App() {
  const { session, profile, loading, init } = useSession();
  const { pathname } = useLocation();

  useEffect(() => { init(); }, [init]);

  if (!configured) return <Setup />;
  if (loading) return <div className="min-h-dvh bg-bg" />;
  if (!session) return <Routes><Route path="*" element={<Login />} /></Routes>;
  if (!profile) return <Routes><Route path="*" element={<Onboarding />} /></Routes>;

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/entrenos" element={<History />} />
        <Route path="/entrenos/nuevo" element={<NewWorkout />} />
        <Route path="/progreso" element={<Progress />} />
        <Route path="/logros" element={<Achievements />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/challenges" element={<Placeholder title="Challenges" note="Listado, detalle con hoja de inscripción, resultado y rankings — pantallas 15–18 del board." />} />
        <Route path="/social" element={<Placeholder title="Social" note="Feed de corredores seguidos, likes y comentarios — pantalla 19 del board." />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {ROOTS.includes(pathname) && <div className="mx-auto w-full max-w-[520px] px-5"><TabBar /></div>}
    </>
  );
}
