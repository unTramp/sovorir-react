import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminLessonBuilderView } from '../../components/center/AdminLessonBuilderView';
import { getSyncedAdminLesson } from '../../lib/adminLessonBuilderStorage';
import { useAuthStore } from '../../stores/useAuthStore';

describe('AdminLessonBuilderView', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      profile: {
        id: 'admin-1',
        schoolId: 'school-1',
        role: 'admin',
        fullName: 'Тестовый Администратор',
        avatarUrl: '/assets/student-avatar.png',
        email: 'admin@sovorir.dev',
        className: null,
      },
      firstName: 'Тестовый',
      lastName: 'Администратор',
      avatarUrl: '/assets/student-avatar.png',
      isLoading: false,
      error: null,
      authReady: true,
    });
  });

  afterEach(() => {
    cleanup();
    useAuthStore.setState({
      profile: null,
      firstName: '',
      lastName: '',
      avatarUrl: '/assets/student-avatar.png',
      isLoading: false,
      error: null,
      authReady: false,
    });
  });

  it('keeps lesson edits staged locally until save changes is pressed', async () => {
    const user = userEvent.setup();
    render(<AdminLessonBuilderView />);

    const titleInput = await screen.findByLabelText('Название урока');
    expect(titleInput).toHaveValue('Приветствия и прощания');
    expect(getSyncedAdminLesson()?.title).toBe('Приветствия и прощания');

    await user.clear(titleInput);
    await user.type(titleInput, 'Приветствия для друзей');

    expect(screen.getByText('Есть несохранённые изменения')).toBeInTheDocument();
    expect(getSyncedAdminLesson()?.title).toBe('Приветствия и прощания');

    await user.click(screen.getByRole('button', { name: 'Сохранить изменения' }));

    await waitFor(() => {
      expect(getSyncedAdminLesson()?.title).toBe('Приветствия для друзей');
    });
  });
});
