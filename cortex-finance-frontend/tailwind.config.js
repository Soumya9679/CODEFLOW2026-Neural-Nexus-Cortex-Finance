/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgPrimary: '#0F0F11',
        bgSecondary: '#151518',
        bgTertiary: '#1B1B20',
        accentLime: '#D7FF3F',
        accentLimeAlt: '#A6FF4D',
        accentRed: '#FF5C75',
        accentOrange: '#FFB84D',
        accentBlue: '#52A8FF',
        // Keep old names mapped to new values for backward compat
        accentCyan: '#D7FF3F',
        accentPurple: '#A6FF4D',
        accentGreen: '#A6FF4D',
        textSecondary: 'rgba(255,255,255,0.65)',
        textMuted: 'rgba(255,255,255,0.4)',
        glassBg: 'rgba(255,255,255,0.06)',
        glassBgHover: 'rgba(255,255,255,0.08)',
        glassBorder: 'rgba(255,255,255,0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif']
      },
      borderRadius: {
        'glass': '24px',
        'glass-lg': '28px',
        'glass-xl': '32px',
      },
      backdropBlur: {
        'glass': '18px',
        'glass-lg': '24px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glowLime 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'ambient': 'ambient 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowLime: {
          '0%': { boxShadow: '0 0 5px rgba(215,255,63,0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(215,255,63,0.4)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
        ambient: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.5' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)',
        'glass-hover': '0 16px 48px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)',
        'lime-glow': '0 0 20px rgba(215,255,63,0.2)',
        'lime-glow-lg': '0 0 40px rgba(215,255,63,0.3)',
        'card-depth': '0 4px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }
    },
  },
  plugins: [],
}
