import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--color-primary-dark-rgb) / <alpha-value>)',
        content: 'rgb(var(--color-bg-content-rgb) / <alpha-value>)',
        app: 'var(--color-bg-app)',
        surface: 'var(--color-bg-surface)',
        border: 'var(--color-border)',
        muted: 'var(--color-text-muted)',
        dark: 'var(--color-text)',
        'primary-light': 'var(--color-primary-light)',
        'audio-teacher': 'var(--color-bg-teacher-to)',
        'audio-student': 'var(--color-bg-student-to)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
        armenian: ['Noto Sans Armenian', 'Inter', 'sans-serif'],
      },
      width: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
} satisfies Config;
