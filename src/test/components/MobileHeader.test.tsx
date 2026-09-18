import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { MobileHeader } from '../../components/layout/MobileHeader';
import { useLessonStore } from '../../stores/useLessonStore';

vi.mock('../../hooks/useLessonCatalog', () => ({
  useLessonCatalog: () => ({
    currentLesson: { id: 1, apiId: 'lesson-api-1', title: 'Поздороваться и попрощаться' },
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

function renderHeader(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <MobileHeader />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('MobileHeader lesson navigation', () => {
  beforeEach(() => {
    useLessonStore.setState({ currentSection: 1, totalSections: 5 });
  });

  afterEach(cleanup);

  it('returns to the previous lesson step before leaving the lesson', () => {
    useLessonStore.setState({ currentSection: 3, totalSections: 5 });
    renderHeader('/lesson?section=3');

    fireEvent.click(screen.getByRole('button', { name: 'Предыдущий шаг' }));

    expect(useLessonStore.getState().currentSection).toBe(2);
    expect(screen.getByTestId('location')).toHaveTextContent('/lesson?lesson=lesson-api-1&section=2');
  });

  it('preserves an explicit deep-link lesson identity when going back', () => {
    useLessonStore.setState({ currentSection: 4, totalSections: 5 });
    renderHeader('/lesson?lesson=completed-lesson-api&section=4');

    fireEvent.click(screen.getByRole('button', { name: 'Предыдущий шаг' }));

    expect(useLessonStore.getState().currentSection).toBe(3);
    expect(screen.getByTestId('location')).toHaveTextContent('/lesson?lesson=completed-lesson-api&section=3');
  });

  it('leaves the lesson from its first step', () => {
    renderHeader('/lesson?section=1');

    fireEvent.click(screen.getByRole('button', { name: 'Выйти из урока' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/course');
  });
});
