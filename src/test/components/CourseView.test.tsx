import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { CourseView } from '../../components/center/CourseView';

vi.mock('../../hooks/useLessonCatalog', () => ({
  useLessonCatalog: () => ({
    lessons: [
      {
        id: 1,
        apiId: 'api-lesson-1',
        title: 'Поздороваться и попрощаться',
        icon: '📖',
        status: 'current',
        sections: [
          { id: 's1', title: 'Приветствие', type: 'lesson', icon: '📄', status: 'in-progress' },
          { id: 's2', title: 'Прощание', type: 'lesson', icon: '📄', status: 'pending' },
        ],
      },
      {
        id: 2,
        apiId: 'api-lesson-2',
        title: 'Армянский алфавит',
        icon: '📖',
        status: 'locked',
        sections: [
          { id: 's3', title: 'Буквы', type: 'lesson', icon: '📄', status: 'locked' },
        ],
      },
    ],
    isLoading: false,
    error: null,
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>;
}

describe('CourseView', () => {
  afterEach(cleanup);

  it('opens the current lesson by stable api id and keeps locked lessons unavailable', () => {
    render(
      <MemoryRouter initialEntries={['/course']}>
        <CourseView />
        <LocationProbe />
      </MemoryRouter>,
    );

    const currentLesson = screen.getByRole('button', { name: /Поздороваться и попрощаться/ });
    const lockedLesson = screen.getByRole('button', { name: /Армянский алфавит/ });

    expect(currentLesson).toBeEnabled();
    expect(lockedLesson).toBeDisabled();

    fireEvent.click(currentLesson);
    expect(screen.getByTestId('location')).toHaveTextContent('/lesson?lesson=api-lesson-1&section=1');
  });
});
