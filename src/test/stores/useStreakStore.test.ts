import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStreakStore } from '../../stores/useStreakStore';

// Freeze time to a known date
const FIXED_DATE = '2026-04-05';
const YESTERDAY = '2026-04-04';

vi.mock('../../lib/dateUtils', () => ({
  todayISO: () => FIXED_DATE,
  yesterdayISO: () => YESTERDAY,
}));

// Also mock practiceEvents so the module-level listener doesn't cause side-effects
vi.mock('../../lib/practiceEvents', () => ({
  practiceEvents: { on: vi.fn(), emit: vi.fn() },
}));

beforeEach(() => {
  useStreakStore.setState({
    currentStreak: 0,
    longestStreak: 0,
    practiceDates: [],
    lastPracticeDate: null,
  });
});

describe('useStreakStore', () => {
  it('starts at zero streak', () => {
    expect(useStreakStore.getState().currentStreak).toBe(0);
  });

  it('records first practice and sets streak to 1', () => {
    useStreakStore.getState().recordPractice();
    const s = useStreakStore.getState();
    expect(s.currentStreak).toBe(1);
    expect(s.practiceDates).toContain(FIXED_DATE);
  });

  it('does not double-count practice on same day', () => {
    useStreakStore.getState().recordPractice();
    useStreakStore.getState().recordPractice();
    expect(useStreakStore.getState().practiceDates).toHaveLength(1);
    expect(useStreakStore.getState().currentStreak).toBe(1);
  });

  it('increments streak on consecutive days', () => {
    useStreakStore.setState({ currentStreak: 3, lastPracticeDate: YESTERDAY });
    useStreakStore.getState().recordPractice();
    expect(useStreakStore.getState().currentStreak).toBe(4);
  });

  it('resets streak when gap in days', () => {
    useStreakStore.setState({ currentStreak: 5, lastPracticeDate: '2026-03-01' });
    useStreakStore.getState().recordPractice();
    expect(useStreakStore.getState().currentStreak).toBe(1);
  });

  it('updates longestStreak when current exceeds it', () => {
    useStreakStore.setState({ currentStreak: 9, longestStreak: 9, lastPracticeDate: YESTERDAY });
    useStreakStore.getState().recordPractice();
    expect(useStreakStore.getState().longestStreak).toBe(10);
  });

  it('recalculateStreak resets to 0 if no recent practice', () => {
    useStreakStore.setState({ currentStreak: 7, lastPracticeDate: '2026-01-01' });
    useStreakStore.getState().recalculateStreak();
    expect(useStreakStore.getState().currentStreak).toBe(0);
  });

  it('recalculateStreak preserves streak if practiced today', () => {
    useStreakStore.setState({ currentStreak: 3, lastPracticeDate: FIXED_DATE });
    useStreakStore.getState().recalculateStreak();
    expect(useStreakStore.getState().currentStreak).toBe(3);
  });
});
