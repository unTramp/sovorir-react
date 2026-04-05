import { describe, it, expect } from 'vitest';
import { todayISO, yesterdayISO, getWeekDays } from '../../lib/dateUtils';

describe('todayISO', () => {
  it('returns a valid ISO date string', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches current date', () => {
    const expected = new Date().toISOString().slice(0, 10);
    expect(todayISO()).toBe(expected);
  });
});

describe('yesterdayISO', () => {
  it('returns a date one day before today', () => {
    const today = new Date(todayISO());
    const yesterday = new Date(yesterdayISO());
    const diff = today.getTime() - yesterday.getTime();
    expect(diff).toBe(24 * 60 * 60 * 1000);
  });
});

describe('getWeekDays', () => {
  it('returns exactly 7 days', () => {
    expect(getWeekDays()).toHaveLength(7);
  });

  it('has exactly one day marked as today', () => {
    const days = getWeekDays();
    const todayDays = days.filter((d) => d.isToday);
    expect(todayDays).toHaveLength(1);
  });

  it('uses Russian abbreviated day labels', () => {
    const labels = getWeekDays().map((d) => d.label);
    expect(labels).toEqual(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']);
  });

  it('all dates are valid ISO strings', () => {
    getWeekDays().forEach((d) => {
      expect(d.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
