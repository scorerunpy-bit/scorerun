/** Estados del Run Score. La fuente de verdad del CÁLCULO es la Edge Function
 *  `compute-score`; acá solo vive el mapeo de número a presentación. */
export const SCORE_STATES = [
  { min: 90, max: 100, key: 'excellent', label: 'Excelente',      hint: 'Andá con todo',        color: 'score-excellent' },
  { min: 75, max: 89,  key: 'good',      label: 'Muy bien',       hint: 'Podés exigirte',      color: 'score-good' },
  { min: 60, max: 74,  key: 'moderate',  label: 'Bien / moderá',  hint: 'Bajá la intensidad',  color: 'score-moderate' },
  { min: 40, max: 59,  key: 'recovery',  label: 'Recuperación',   hint: 'Trote suave',         color: 'score-recovery' },
  { min: 0,  max: 39,  key: 'rest',      label: 'Descanso',       hint: 'Hoy no se corre',     color: 'score-rest' },
];

export const HEX = {
  excellent: '#6fc79f', good: '#8fc98a', moderate: '#d4c078',
  recovery: '#df9f6f', rest: '#dd8b8b',
};

export function scoreState(value) {
  if (value == null) return null;
  return SCORE_STATES.find((s) => value >= s.min && value <= s.max) ?? SCORE_STATES.at(-1);
}

export function scoreHex(value) {
  const s = scoreState(value);
  return s ? HEX[s.key] : '#75798c';
}
