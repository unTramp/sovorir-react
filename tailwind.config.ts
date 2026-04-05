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
        jakarta: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs:   ['12px', { lineHeight: '1.5' }],
        sm:   ['13px', { lineHeight: '1.5' }],
        base: ['14px', { lineHeight: '1.6' }],
        md:   ['15px', { lineHeight: '1.6' }],
        lg:   ['16px', { lineHeight: '1.5' }],
        xl:   ['18px', { lineHeight: '1.4' }],
        '2xl':['20px', { lineHeight: '1.3' }],
        '3xl':['24px', { lineHeight: '1.25' }],
        '4xl':['32px', { lineHeight: '1.1' }],
      },
      screens: {
        sm: '480px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      boxShadow: {
        sm:  '0 1px 4px rgba(30, 20, 18, 0.06)',
        DEFAULT: '0 2px 8px rgba(30, 20, 18, 0.08)',
        md:  '0 4px 14px rgba(30, 20, 18, 0.10)',
        lg:  '0 8px 24px rgba(30, 20, 18, 0.12)',
        xl:  '0 12px 40px rgba(30, 20, 18, 0.16)',
        none: 'none',
      },
      borderRadius: {
        sm:   '6px',
        DEFAULT: '10px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl':'24px',
        full: '9999px',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '300ms',
        slow: '500ms',
      },
      width: {
        sidebar: '280px',
      },
    },
  },
  plugins: [],
} satisfies Config;
