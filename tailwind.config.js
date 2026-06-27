/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        casino: {
          bg: '#0a0e1a',
          'bg-light': '#121827',
          'bg-card': 'rgba(20, 30, 50, 0.8)',
          gold: '#ffd700',
          'gold-light': '#ffe44d',
          'gold-dark': '#b8960f',
          emerald: '#10b981',
          'emerald-dark': '#059669',
          red: '#dc2626',
          'red-dark': '#b91c1c',
          border: 'rgba(255, 215, 0, 0.2)',
          'border-strong': 'rgba(255, 215, 0, 0.4)',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
        'glow-gold-sm': '0 0 10px rgba(255, 215, 0, 0.3)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-red': '0 0 20px rgba(220, 38, 38, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'confetti': 'confetti 1s ease-out forwards',
        'winner-reveal': 'winner-reveal 0.6s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.3)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(720deg)', opacity: '0' },
        },
        'winner-reveal': {
          '0%': { transform: 'scale(0.5) rotate(-10deg)', opacity: '0' },
          '50%': { transform: 'scale(1.2) rotate(5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-casino': 'linear-gradient(135deg, #0a0e1a 0%, #1a1f35 50%, #0a0e1a 100%)',
        'gradient-gold': 'linear-gradient(135deg, #ffd700 0%, #ffe44d 50%, #ffd700 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(30, 40, 60, 0.9) 0%, rgba(20, 30, 50, 0.95) 100%)',
      },
    },
  },
  plugins: [],
};
