import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Нажми меня</Button>);
    expect(screen.getByRole('button', { name: 'Нажми меня' })).toBeInTheDocument();
  });

  it('applies primary variant classes by default', () => {
    render(<Button>OK</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('btn--primary');
    expect(btn.className).toContain('btn--md');
  });

  it('applies secondary variant class', () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole('button').className).toContain('btn--secondary');
  });

  it('applies ghost variant class', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button').className).toContain('btn--ghost');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">S</Button>);
    expect(screen.getByRole('button').className).toContain('btn--sm');

    rerender(<Button size="lg">L</Button>);
    expect(screen.getByRole('button').className).toContain('btn--lg');
  });

  it('merges custom className', () => {
    render(<Button className="my-custom">X</Button>);
    expect(screen.getByRole('button').className).toContain('my-custom');
  });

  it('calls onClick handler', async () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Disabled</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });
});
