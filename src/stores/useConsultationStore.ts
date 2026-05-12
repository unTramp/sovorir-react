import { create } from 'zustand';
import { apiClient } from '../lib/apiClient';
import type { ConsultationSlot, Booking, CreateSlotPayload } from '../types/consultation';

interface ConsultationState {
  slots: ConsultationSlot[];
  myBookings: Booking[];
  isLoading: boolean;
  error: string | null;

  loadSlots: () => Promise<void>;
  bookSlot: (slotId: string) => Promise<void>;
  cancelBooking: (slotId: string) => Promise<void>;
  createSlot: (payload: CreateSlotPayload) => Promise<void>;
  isBooked: (slotId: string) => boolean;
}

export const useConsultationStore = create<ConsultationState>()((set, get) => ({
  slots: [],
  myBookings: [],
  isLoading: false,
  error: null,

  loadSlots: async () => {
    set({ isLoading: true, error: null });
    try {
      const [slots, bookings] = await Promise.all([
        apiClient.get<ConsultationSlot[]>('/consultation-slots'),
        apiClient.get<Booking[]>('/my-bookings'),
      ]);
      set({ slots, myBookings: bookings, isLoading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка загрузки', isLoading: false });
    }
  },

  bookSlot: async (slotId) => {
    // Optimistic: increment bookedCount
    set((state) => ({
      slots: state.slots.map((s) =>
        s.id === slotId ? { ...s, bookedCount: s.bookedCount + 1 } : s,
      ),
    }));
    try {
      const booking = await apiClient.post<Booking>(`/consultation-slots/${slotId}/book`, {});
      set((state) => ({ myBookings: [...state.myBookings, booking] }));
    } catch (err) {
      // Rollback
      set((state) => ({
        slots: state.slots.map((s) =>
          s.id === slotId ? { ...s, bookedCount: s.bookedCount - 1 } : s,
        ),
        error: err instanceof Error ? err.message : 'Ошибка бронирования',
      }));
      throw err;
    }
  },

  cancelBooking: async (slotId) => {
    const booking = get().myBookings.find((b) => b.slotId === slotId);
    if (!booking) return;

    // Optimistic: decrement bookedCount, remove booking
    set((state) => ({
      slots: state.slots.map((s) =>
        s.id === slotId ? { ...s, bookedCount: Math.max(0, s.bookedCount - 1) } : s,
      ),
      myBookings: state.myBookings.filter((b) => b.slotId !== slotId),
    }));
    try {
      await apiClient.post(`/consultation-slots/${slotId}/cancel`, {});
    } catch (err) {
      // Rollback
      set((state) => ({
        slots: state.slots.map((s) =>
          s.id === slotId ? { ...s, bookedCount: s.bookedCount + 1 } : s,
        ),
        myBookings: booking ? [...state.myBookings, booking] : state.myBookings,
        error: err instanceof Error ? err.message : 'Ошибка отмены',
      }));
      throw err;
    }
  },

  createSlot: async (payload) => {
    try {
      const slot = await apiClient.post<ConsultationSlot>('/consultation-slots', payload);
      set((state) => ({ slots: [...state.slots, slot] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Ошибка создания слота' });
      throw err;
    }
  },

  isBooked: (slotId) => get().myBookings.some((b) => b.slotId === slotId && b.status !== 'cancelled'),
}));
