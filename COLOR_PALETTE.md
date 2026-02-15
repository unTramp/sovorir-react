# Цветовая палитра Sovorir

Полная документация цветовой схемы проекта. Все цвета определены в CSS-переменных (`globals.css`), маппятся через Tailwind (`tailwind.config.ts`), а также есть хардкод в SVG-градиентах компонентов.

---

## 1. Терракота (Primary / Тема преподавателя)

| Имя | Hex | CSS-переменная | Tailwind |
|-----|-----|----------------|----------|
| Primary | `#B46A58` | `--color-primary` | `text-primary`, `bg-primary` |
| Primary Light | `#C68473` | `--color-primary-light` | `bg-primary-light` |
| Primary Dark | `#7A3E34` | `--color-primary-dark` | `text-accent`, `bg-accent` |

## 2. Олива (Тема ученика)

| Имя | Hex | CSS-переменная |
|-----|-----|----------------|
| Student | `#8B9B6B` | `--color-student` |
| Student Dark | `#6B7A52` | `--color-student-dark` |
| Student Muted | `#7A8A5C` | `--color-student-muted` |
| Student Border | `#82915F` | `--color-student-border` |

## 3. Текст

| Имя | Hex | Tailwind |
|-----|-----|----------|
| Dark | `#3A302D` | `text-dark` |
| Muted | `#8B746C` | `text-muted` |
| White | `#FFFFFF` | — |

## 4. Фоны

| Имя | Hex | Tailwind |
|-----|-----|----------|
| App | `#F6F2EF` | `bg-app` |
| Sidebar | `#ECE4DE` → `#E7DDD6` | `bg-sidebar` |
| Chat | `#FAF8F6` | `bg-center` |
| Surface | `#F1E8E2` | `bg-surface` |
| Right Panel | `#FBF9F8` | `bg-rightpanel` |
| Teacher Bubble | `#FBF9F8` → `#EFE2DA` | — |
| Student Bubble | `#F4F6EF` → `#E4E9D8` | — |

## 5. Границы

| Имя | Hex | Tailwind |
|-----|-----|----------|
| Border | `#DDC9BF` | `border-border` |

## 6. Звёзды (рейтинг)

| Имя | Hex |
|-----|-----|
| Filled gradient | `#E8C84A` → `#C9A84C` → `#A8882E` |
| Empty | `#E0D5B8` |

## 7. Прогресс

| Имя | Hex |
|-----|-----|
| Gradient | `#C47A62` → `#9B5A4A` |
| Track | `rgba(139, 116, 108, 0.12)` |

## 8. Waveform (аудио)

| Роль | Played | Unplayed |
|------|--------|----------|
| Teacher | `#B46A58` | `#DDC9BF` |
| Student | `#8B9B6B` | `#D2DABE` |

## 9. Спецэффекты

| Имя | Значение |
|-----|----------|
| Backdrop | `rgba(58, 48, 45, 0.42)` |

---

## Источники цветов

- **CSS-переменные:** `src/styles/globals.css`
- **Tailwind-маппинг:** `tailwind.config.ts`
- **SVG-градиенты:** `VideoSection.tsx`, `ProgressCircle.tsx`, `StudentProfile.tsx`
- **Иконки:** `src/icons/index.tsx`
