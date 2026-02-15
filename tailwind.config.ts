import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
        accent: 'rgb(var(--color-primary-dark-rgb) / <alpha-value>)',
        center: 'rgb(var(--color-bg-chat-rgb) / <alpha-value>)',
        app: 'var(--color-bg-app)',
        sidebar: 'var(--color-bg-sidebar)',
        surface: 'var(--color-bg-surface)',
        border: 'var(--color-border)',
        muted: 'var(--color-text-muted)',
        dark: 'var(--color-text)',
        rightpanel: 'var(--color-bg-teacher-from)',
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
        'audio-panel': '300px',
      },
    },
  },
  plugins: [],
} satisfies Config;
