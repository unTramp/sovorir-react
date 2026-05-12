import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SlotCard } from '../../components/consultations/SlotCard';
import { useConsultationStore } from '../../stores/useConsultationStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type { ConsultationSlot } from '../../types/consultation';
import type { Profile } from '../../types/api';

vi.mock('../../lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

const mockProfile: Profile = {
  id: 'student-1',
  schoolId: 's1',
  role: 'student',
  fullName: 'Андрей Дорофеев',
  avatarUrl: null,
  email: 'student@sovorir.dev',
  className: 'A1',
};

const baseSlot: ConsultationSlot = {
  id: 'slot-1',
  teacherId: 'teacher-1',
  teacherName: 'Лусине Тамамян',
  startsAt: new Date(Date.now() + 2 * 86400000).toISOString(),
  durationMin: 60,
  maxParticipants: 5,
  bookedCount: 1,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  useConsultationStore.setState({ slots: [], myBookings: [], isLoading: false, error: null });
  useAuthStore.setState({ profile: { ...mockProfile, role: 'student' }, authReady: true });
  vi.clearAllMocks();
});

describe('SlotCard', () => {
  it('shows "Записаться" button for student on available slot', () => {
    render(<SlotCard slot={baseSlot} />);
    expect(screen.getByText('Записаться')).toBeInTheDocument();
    expect(screen.getByText('Записаться')).not.toBeDisabled();
  });

  it('shows "Групповая" type for slot with maxParticipants > 1', () => {
    render(<SlotCard slot={baseSlot} />);
    expect(screen.getByText('Групповая')).toBeInTheDocument();
  });

  it('shows "Индивидуальная" type for slot with maxParticipants === 1', () => {
    render(<SlotCard slot={{ ...baseSlot, maxParticipants: 1, bookedCount: 0 }} />);
    expect(screen.getByText('Индивидуальная')).toBeInTheDocument();
  });

  it('disables "Записаться" when slot is full', () => {
    render(<SlotCard slot={{ ...baseSlot, bookedCount: 5, maxParticipants: 5 }} />);
    expect(screen.getByText('Записаться')).toBeDisabled();
    expect(screen.getAllByText('Мест нет').length).toBeGreaterThan(0);
  });

  it('shows "Отменить запись" when student has booked', () => {
    useConsultationStore.setState({
      myBookings: [{ id: 'bkg-1', slotId: 'slot-1', studentId: 'student-1', status: 'confirmed', createdAt: '' }],
    });
    render(<SlotCard slot={baseSlot} />);
    expect(screen.getByText('Отменить запись')).toBeInTheDocument();
    expect(screen.getByText('Записаны')).toBeInTheDocument();
  });

  it('"Записаться" button calls bookSlot', () => {
    const bookSlot = vi.fn().mockResolvedValue(undefined);
    useConsultationStore.setState({ bookSlot } as never);
    render(<SlotCard slot={baseSlot} />);
    fireEvent.click(screen.getByText('Записаться'));
    expect(bookSlot).toHaveBeenCalledWith('slot-1');
  });

  it('"Отменить запись" button calls cancelBooking', () => {
    useConsultationStore.setState({
      myBookings: [{ id: 'bkg-1', slotId: 'slot-1', studentId: 'student-1', status: 'confirmed', createdAt: '' }],
      cancelBooking: vi.fn().mockResolvedValue(undefined),
    } as never);
    render(<SlotCard slot={baseSlot} />);
    fireEvent.click(screen.getByText('Отменить запись'));
    expect(useConsultationStore.getState().cancelBooking).toHaveBeenCalledWith('slot-1');
  });

  it('does not show action buttons for teacher role', () => {
    useAuthStore.setState({ profile: { ...mockProfile, role: 'teacher' }, authReady: true });
    render(<SlotCard slot={baseSlot} />);
    expect(screen.queryByText('Записаться')).not.toBeInTheDocument();
    expect(screen.queryByText('Отменить запись')).not.toBeInTheDocument();
  });
});
