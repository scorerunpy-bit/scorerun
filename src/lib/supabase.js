import { createClient } from '@supabase/supabase-js';

// Dos fuentes, en orden de prioridad:
//   1. /public/config.js  — se sirve tal cual, se edita sin rebuild
//   2. variables de entorno del build (Vite), para desarrollo local
const runtime = typeof window !== 'undefined' ? window.__SCORERUN_CONFIG : null;

const PLACEHOLDERS = ['TU-PROYECTO', 'TU-ANON-KEY', 'xxxx', 'undefined', 'null'];

function clean(v) {
  if (typeof v !== 'string') return '';
  const s = v.trim().replace(/^['"]|['"]$/g, '');
  if (!s || PLACEHOLDERS.some((p) => s.includes(p))) return '';
  return s;
}

/** Acepta la URL como venga: con o sin https://, con o sin barra final. */
function normalizeUrl(v) {
  let s = clean(v);
  if (!s) return '';
  s = s.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.origin : '';
  } catch {
    return '';
  }
}

const url = normalizeUrl(runtime?.url) || normalizeUrl(import.meta.env.VITE_SUPABASE_URL);
const key = clean(runtime?.anonKey) || clean(import.meta.env.VITE_SUPABASE_ANON_KEY);

// la anon key es un JWT: tres bloques separados por punto, empieza con eyJ
const keyLooksValid = /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(key);

export const configured = Boolean(url && keyLooksValid);

export const configDiagnosis = {
  url,
  urlOk: Boolean(url),
  keyOk: keyLooksValid,
  keyPreview: key ? key.slice(0, 12) + '…' : '',
  source: normalizeUrl(runtime?.url) ? 'public/config.js' : url ? 'variables del build' : 'ninguna',
};

if (!configured) {
  console.error('ScoreRun · configuración de Supabase incompleta', configDiagnosis);
}

export const supabase = configured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : stub();

function stub() {
  const err = { message: 'Supabase sin configurar' };
  const chain = {
    select: () => chain, insert: () => chain, update: () => chain, upsert: () => chain,
    delete: () => chain, eq: () => chain, gte: () => chain, order: () => chain, limit: () => chain,
    maybeSingle: async () => ({ data: null, error: err }),
    single: async () => ({ data: null, error: err }),
    then: (r) => r({ data: null, error: err }),
  };
  return {
    from: () => chain,
    functions: { invoke: async () => ({ data: null, error: err }) },
    auth: {
      getSession: async () => ({ data: { session: null } }),
      getUser: async () => ({ data: { user: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ error: err }),
      signUp: async () => ({ error: err }),
      signOut: async () => {},
    },
  };
}
