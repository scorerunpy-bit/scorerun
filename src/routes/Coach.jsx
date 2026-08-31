import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, X } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { Screen } from '../components/Screen';
import { HEX } from '../lib/score';

const SUGGESTIONS = ['¿Por qué tengo este Score?', '¿Qué hago mañana?', '¿Estoy mejorando?'];

/** Chat en lenguaje natural. NUNCA un diagnóstico médico: el disclaimer es
 *  obligatorio en cualquier respuesta que toque dolor o salud, y lo impone el
 *  system prompt de la Edge Function `coach`. */
export default function Coach() {
  const nav = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput(''); setBusy(true);
    setMessages((m) => [...m, { role: 'user', content: q }]);
    const { data, error } = await supabase.functions.invoke('coach', { body: { message: q } });
    setMessages((m) => [...m, error
      ? { role: 'assistant', content: 'No pude responder ahora. Probá de nuevo en un rato.' }
      : { role: 'assistant', ...data }]);
    setBusy(false);
  }

  return (
    <Screen>
      <header className="flex items-center gap-3 border-b border-rail pb-4">
        <button onClick={() => nav(-1)} className="text-neutral-400" aria-label="Cerrar"><X size={20} /></button>
        <span className="flex flex-1 flex-col gap-px">
          <span className="text-base font-medium">Coach</span>
          <span className="text-xs text-neutral-600">Lee tus últimos 30 días</span>
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 py-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user'
            ? 'max-w-[78%] self-end rounded-[14px_14px_4px_14px] bg-accent/[.14] px-[15px] py-3 text-[15px] leading-[1.45] shadow-[0_0_0_1px_#423a6a]'
            : 'max-w-[86%] self-start rounded-[14px_14px_14px_4px] bg-card px-4 py-3.5 shadow-hairline'}>
            {m.role === 'user' ? m.content : <CoachAnswer {...m} />}
          </div>
        ))}
        {busy && <div className="max-w-[86%] self-start rounded-[14px_14px_14px_4px] bg-card px-4 py-3.5 text-[15px] text-neutral-600 shadow-hairline">Pensando…</div>}
      </div>

      <div className="flex flex-col gap-3 border-t border-rail pt-3.5">
        <div className="flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="whitespace-nowrap rounded-full bg-card px-3.5 py-[9px] text-[13px] text-neutral-400 shadow-edge">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2.5">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Preguntale al coach…"
            className="h-[46px] flex-1 rounded bg-card px-[15px] text-[15px] shadow-edge outline-none placeholder:text-neutral-700 focus:shadow-[0_0_0_1px_#9184d9]" />
          <button type="submit" disabled={busy}
            className="flex h-[46px] w-[46px] items-center justify-center rounded border border-accent text-accent disabled:opacity-45">
            <ArrowUp size={19} />
          </button>
        </form>
      </div>
    </Screen>
  );
}

function CoachAnswer({ content, factors, disclaimer }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="m-0 text-[15px] leading-[1.5]" style={{ textWrap: 'pretty' }}>{content}</p>
      {factors?.length > 0 && (
        <div className="flex flex-col gap-2">
          {factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-[3px] h-4 w-[3px] shrink-0 rounded-sm" style={{ background: HEX[f.tone] ?? '#75798c' }} />
              <span className="text-sm leading-[1.45] text-neutral-300">{f.text}</span>
            </div>
          ))}
        </div>
      )}
      {disclaimer && <span className="text-xs leading-[1.4] text-neutral-700">{disclaimer}</span>}
    </div>
  );
}
