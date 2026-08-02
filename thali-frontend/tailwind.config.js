/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F0E0C',
          card: '#1A1916',
          border: '#2A2927',
        },
        cream: '#F5F0E8',
        saffron: '#E8793A',
        mint: '#2ECC8F',
        danger: '#C0392B',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
      keyframes: {
        pulse_dot: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
      },
      animation: {
        pulse_dot: 'pulse_dot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
