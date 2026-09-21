/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    // Apple's own breakpoints: the marketing pages step at 734, 1068 and 1440.
    screens: {
      sm: '480px',
      md: '734px',
      lg: '1068px',
      xl: '1440px',
    },
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Inter',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: ['SF Mono', 'ui-monospace', 'JetBrains Mono', 'Menlo', 'monospace'],
      },
      colors: {
        // System colours, straight from the Apple HIG palette.
        ink: {
          DEFAULT: '#1d1d1f',
          soft: '#424245',
          muted: '#6e6e73',
          faint: '#86868b',
        },
        surface: {
          DEFAULT: '#ffffff',
          sunken: '#f5f5f7',
          raised: '#fbfbfd',
        },
        night: {
          DEFAULT: '#000000',
          raised: '#1d1d1f',
          sunken: '#161617',
          line: '#2c2c2e',
        },
        accent: {
          DEFAULT: '#0071e3',
          hover: '#0077ed',
          soft: '#2997ff',
        },
        system: {
          blue: '#0a84ff',
          green: '#30d158',
          indigo: '#5e5ce6',
          orange: '#ff9f0a',
          pink: '#ff375f',
          purple: '#bf5af2',
          red: '#ff453a',
          teal: '#40c8e0',
          yellow: '#ffd60a',
        },
      },
      fontSize: {
        // Apple's display sizes, with the tight tracking they use on headlines.
        display: ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '600' }],
        headline: ['clamp(2rem, 4.5vw, 3.5rem)', { lineHeight: '1.08', letterSpacing: '-0.025em', fontWeight: '600' }],
        title: ['clamp(1.5rem, 2.6vw, 2.25rem)', { lineHeight: '1.14', letterSpacing: '-0.02em', fontWeight: '600' }],
        lede: ['clamp(1.125rem, 1.7vw, 1.5rem)', { lineHeight: '1.42', letterSpacing: '-0.01em' }],
        eyebrow: ['0.8125rem', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      borderRadius: {
        apple: '18px',
        card: '22px',
        panel: '28px',
        pill: '980px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,.04), 0 12px 40px -12px rgba(0,0,0,.10)',
        lift: '0 8px 24px rgba(0,0,0,.06), 0 24px 64px -20px rgba(0,0,0,.18)',
        glass: 'inset 0 1px 0 rgba(255,255,255,.55), 0 1px 24px rgba(0,0,0,.06)',
      },
      backdropBlur: {
        chrome: '20px',
      },
      transitionTimingFunction: {
        // The curve Apple uses for nearly every UI transition.
        apple: 'cubic-bezier(0.28, 0.11, 0.32, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(.8)', opacity: '.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(0.28,0.11,0.32,1) both',
        shimmer: 'shimmer 2s infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.28,0.11,0.32,1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
