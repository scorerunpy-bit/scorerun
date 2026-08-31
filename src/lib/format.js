export function fmtDistance(km) {
  if (km == null) return '—';
  return km.toFixed(2).replace('.', ',');
}

export function fmtDuration(seconds) {
  if (seconds == null) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** '22:45' | '1:02:30' | '2245' -> segundos. Devuelve null si no parsea.
    Tolerante a propósito: en el teclado numérico del celular los dos puntos
    no siempre están a mano, así que también aceptamos dígitos sueltos. */
export function parseDuration(input) {
  if (!input) return null;
  const raw = String(input).trim().replace(/[.,\s]/g, ':');

  if (raw.includes(':')) {
    const parts = raw.split(':').map(Number);
    if (parts.some((n) => Number.isNaN(n) || n < 0)) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }

  // solo dígitos: se leen de derecha a izquierda — ss, luego mm, luego hh
  if (!/^\d{1,6}$/.test(raw)) return null;
  const d = raw.padStart(raw.length <= 4 ? 4 : 6, '0');
  const s = Number(d.slice(-2));
  const m = Number(d.slice(-4, -2));
  const h = d.length > 4 ? Number(d.slice(0, -4)) : 0;
  if (s > 59 || m > 59) return null;
  return h * 3600 + m * 60 + s;
}

/** Máscara mientras se escribe: 2245 -> '22:45', 10230 -> '1:02:30' */
export function maskDuration(input) {
  const d = String(input).replace(/\D/g, '').slice(0, 6);
  if (d.length <= 2) return d;
  if (d.length <= 4) return d.slice(0, -2) + ':' + d.slice(-2);
  return d.slice(0, -4) + ':' + d.slice(-4, -2) + ':' + d.slice(-2);
}

/** Distancia: dígitos y un único separador decimal, máximo dos decimales. */
export function maskDistance(input) {
  let s = String(input).replace(',', '.').replace(/[^\d.]/g, '');
  const i = s.indexOf('.');
  if (i !== -1) s = s.slice(0, i + 1) + s.slice(i + 1).replace(/\./g, '').slice(0, 2);
  return s.slice(0, 6);
}

export function fmtPace(secondsPerKm) {
  if (!secondsPerKm || !Number.isFinite(secondsPerKm)) return '—';
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function paceFrom(distanceKm, durationS) {
  if (!distanceKm || !durationS) return null;
  return durationS / distanceKm;
}

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

export function fmtLongDate(d = new Date()) {
  const date = new Date(d);
  return `${DAYS[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

export function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}
