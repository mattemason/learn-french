/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        'surface-2': v('surface-2'),
        ink: v('ink'),
        'ink-soft': v('ink-soft'),
        line: v('line'),
        primary: v('primary'),
        'primary-ink': v('primary-ink'),
        accent: v('accent'),
        'accent-ink': v('accent-ink'),
        sun: v('sun'),
        sky: v('sky'),
        success: v('success'),
        danger: v('danger'),
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        pop: { '0%': { transform: 'scale(.85)', opacity: '0' }, '60%': { transform: 'scale(1.04)', opacity: '1' }, '100%': { transform: 'scale(1)' } },
        rise: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        shake: { '0%,100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } },
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
      },
      animation: {
        pop: 'pop .35s ease-out both',
        rise: 'rise .35s ease-out both',
        shake: 'shake .3s ease-in-out',
        floaty: 'floaty 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
