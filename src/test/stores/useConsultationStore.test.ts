import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useConsultationStore } from '../../stores/useConsultationStore';
import type { ConsultationSlot, Booking } from '../../types/consultation';

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from '../../lib/apiClient';

const mockSlot: ConsultationSlot = {
  id: 'slot-1',
  teacherId: 'teacher-1',
  teacherName: 'Лусине Тамамян',
  startsAt: new Date(Date.now() + 86400000).toISOString(),
  durationMin: 60,
  maxParticipants: 5,
  bookedCount: 2,
  createdAt: new Date().toISOString(),
};

const mockBooking: Booking = {
  id: 'bkg-1',
  slotId: 'slot-1',
  studentId: 'student-1',
  status: 'confirmed',
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  useConsultationStore.setState({ slots: [], myBookings: [], isLoading: false, error: null });
  vi.clearAllMocks();
});

describe('useConsultationStore', () => {
  it('loadSlots fetches slots and bookings', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce([mockSlot])
      .mockResolvedValueOnce([mockBooking]);
    await useConsultationStore.getState().loadSlots();
    expect(apiClient.get).toHaveBeenCalledWith('/consultation-slots');
    expect(apiClient.get).toHaveBeenCalledWith('/my-bookings');
    expect(useConsultationStore.getState().slots).toEqual([mockSlot]);
    expect(useConsultationStore.getState().myBookings).toEqual([mockBooking]);
  });

  it('loadSlots sets error on failure', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));
    await useConsultationStore.getState().loadSlots();
    expect(useConsultationStore.getState().error).toBe('Network error');
  });

  it('bookSlot increments bookedCount optimistically and adds booking', async () => {
    useConsultationStore.setState({ slots: [mockSlot], myBookings: [] });
    vi.mocked(apiClient.post).mockResolvedValue(mockBooking);
    await useConsultationStore.getState().bookSlot('slot-1');
    expect(useConsultationStore.getState().slots[0].bookedCount).toBe(3);
    expect(useConsultationStore.getState().myBookings).toContainEqual(mockBooking);
  });

  it('bookSlot rolls back bookedCount on failure', async () => {
    useConsultationStore.setState({ slots: [mockSlot], myBookings: [] });
    vi.mocked(apiClient.post).mockRejectedValue(new Error('Full'));
    await expect(useConsultationStore.getState().bookSlot('slot-1')).rejects.toThrow();
    expect(useConsultationStore.getState().slots[0].bookedCount).toBe(2);
  });

  it('cancelBooking decrements bookedCount and removes booking', async () => {
    useConsultationStore.setState({ slots: [mockSlot], myBookings: [mockBooking] });
    vi.mocked(apiClient.post).mockResolvedValue({});
    await useConsultationStore.getState().cancelBooking('slot-1');
    expect(useConsultationStore.getState().slots[0].bookedCount).toBe(1);
    expect(useConsultationStore.getState().myBookings).toHaveLength(0);
  });

  it('cancelBooking does nothing when slot not booked', async () => {
    useConsultationStore.setState({ slots: [mockSlot], myBookings: [] });
    await useConsultationStore.getState().cancelBooking('slot-1');
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('isBooked returns true when active booking exists', () => {
    useConsultationStore.setState({ myBookings: [mockBooking] });
    expect(useConsultationStore.getState().isBooked('slot-1')).toBe(true);
  });

  it('isBooked returns false when booking is cancelled', () => {
    useConsultationStore.setState({ myBookings: [{ ...mockBooking, status: 'cancelled' }] });
    expect(useConsultationStore.getState().isBooked('slot-1')).toBe(false);
  });

  it('isBooked returns false when no booking', () => {
    useConsultationStore.setState({ myBookings: [] });
    expect(useConsultationStore.getState().isBooked('slot-1')).toBe(false);
  });
});
