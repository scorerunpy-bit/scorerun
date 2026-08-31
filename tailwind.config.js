/** Tokens del design system Nocturne + la extensión semántica del Run Score.
 *  Cambiar un valor acá lo cambia en toda la app: no hardcodear hex en componentes. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#161826',
        surface: '#232532',
        // un paso sobre el fondo de app: tarjetas internas
        card: '#1a1c29',
        // fondo de opción no seleccionada
        option: '#1c1e2b',
        // riel / borde interno, más suave que neutral-800
        rail: '#2f3240',
        text: '#e9e9ed',
        accent: {
          DEFAULT: '#9184d9',
          100: '#f5f4ff', 200: '#e7e5fe', 300: '#d2cefd', 400: '#b5abfc',
          500: '#968ae0', 600: '#796cbf', 700: '#5d5294', 800: '#423a6a', 900: '#2b2741',
          // texto sobre botón primario contorneado
          on: '#c6bef0',
        },
        neutral: {
          100: '#f3f5fe', 200: '#e4e7f5', 300: '#cfd3e5', 400: '#b2b6ca',
          500: '#9397ab', 600: '#75798c', 700: '#595d6c', 800: '#3f424d', 900: '#292b31',
        },
        // único fondo saturado permitido (challenge destacado)
        section: { DEFAULT: '#262a60', glow: '#353b80', ghost: '#4c5397' },
        // semántica del Run Score — baja saturación, misma luminosidad que el acento
        score: {
          excellent: '#6fc79f',
          good: '#8fc98a',
          moderate: '#d4c078',
          recovery: '#df9f6f',
          rest: '#dd8b8b',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { sm: '4px', DEFAULT: '8px', md: '8px', lg: '14px', sheet: '20px' },
      boxShadow: {
        hairline: '0 0 0 1px #2f3240',
        edge: '0 0 0 1px #3f424d',
        card: '0 0 0 1px #3f424d, 0 12px 30px rgba(0,0,0,.45)',
        lifted: '0 0 0 1px #3f424d, 0 20px 50px rgba(0,0,0,.6)',
        sheet: '0 -1px 0 #3f424d, 0 -24px 60px rgba(0,0,0,.6)',
      },
      keyframes: {
        pulse_glow: {
          '0%,100%': { opacity: '.55', transform: 'scale(1)' },
          '50%': { opacity: '.9', transform: 'scale(1.04)' },
        },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'pulse-glow': 'pulse_glow 3.4s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
