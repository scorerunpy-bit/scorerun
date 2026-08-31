import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
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

/* La tab bar solo vive en las pantallas raíz. Onboarding, acceso, registro,
   compartir, detalle de challenge, resultado y coach son modales o push de pila. */
const ROOTS = ['/', '/entrenos', '/challenges', '/social', '/perfil'];

export default function App() {
  const { session, profile, loading, init } = useSession();
  const { pathname } = useLocation();

  useEffect(() => { init(); }, [init]);

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
