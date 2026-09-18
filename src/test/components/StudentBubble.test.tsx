import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { StudentBubble } from '../../components/conversation/StudentBubble';

afterEach(cleanup);

describe('StudentBubble', () => {
  it('renders learner content as a right-side conversation bubble', () => {
    render(
      <StudentBubble>
        <span lang="hy">Բարև ձեզ։</span>
      </StudentBubble>,
    );

    const content = screen.getByText('Բարև ձեզ։');
    const bubble = content.closest('.student-bubble');

    expect(screen.getByText('Вы')).toBeInTheDocument();
    expect(bubble).toBeInTheDocument();
    expect(bubble?.parentElement).toHaveClass('student-bubble-wrap');
  });

  it('supports a restrained error state without changing the message role', () => {
    render(
      <StudentBubble state="error">
        <span lang="hy">Ցտեսություն։</span>
      </StudentBubble>,
    );

    expect(screen.getByText('Ցտեսություն։').closest('.student-bubble'))
      .toHaveClass('student-bubble--error');
    expect(screen.getByText('Вы')).toBeInTheDocument();
  });
});
