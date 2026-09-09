/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        elevate: {
          bg: '#F8FAFC',          // Light canvas (clean slate-50)
          'bg-dark': '#0B0F17',   // Dark canvas (deep OLED obsidian slate)
          card: '#FFFFFF',        // Light card surface
          'card-dark': '#131B2A', // Dark card surface
          'card-muted-dark': '#1A2438',
          border: '#E2E8F0',      // Light border (slate-200)
          'border-dark': '#1E293B', // Dark border (slate-800)
          primary: '#0F172A',     // Main text light
          'primary-dark': '#F8FAFC', // Main text dark
          muted: '#64748B',       // Muted slate
          'muted-dark': '#94A3B8',
          accent: '#10B981',      // Emerald Brand
          'accent-hover': '#059669',
          'accent-indigo': '#6366F1',
          'accent-indigo-hover': '#4F46E5',
        },
        neu: {
          base: '#F8FAFC',
          'base-dark': '#0B0F17',
          primary: '#0F172A',
          muted: '#64748B',
          accent: '#10B981',
          'accent-light': '#34D399',
          success: '#10B981',
        }
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Inter"', '"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 12px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'card-dark': '0 4px 24px -2px rgba(0, 0, 0, 0.5), 0 2px 8px -1px rgba(0, 0, 0, 0.3)',
        'card-dark-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 4px 14px -2px rgba(0, 0, 0, 0.4)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.3)',
        'glow-indigo': '0 0 24px -4px rgba(99, 102, 241, 0.3)',
        'glow-rose': '0 0 24px -4px rgba(244, 63, 94, 0.3)',
        'glow-amber': '0 0 24px -4px rgba(245, 158, 11, 0.3)',
        'neu-extruded': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'neu-extruded-hover': '0 10px 25px -3px rgba(15, 23, 42, 0.08)',
        'neu-extruded-sm': '0 2px 8px -1px rgba(15, 23, 42, 0.04)',
        'neu-inset': 'none',
        'neu-inset-deep': 'none',
        'neu-inset-sm': 'none',
        'neu-dark-extruded': '0 4px 24px -2px rgba(0, 0, 0, 0.5)',
        'neu-dark-extruded-hover': '0 10px 28px -3px rgba(0, 0, 0, 0.6)',
        'neu-dark-extruded-sm': '0 2px 8px -1px rgba(0, 0, 0, 0.4)',
        'neu-dark-inset': 'none',
        'neu-dark-inset-deep': 'none',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      }
    },
  },
  plugins: [],
};
