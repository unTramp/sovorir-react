export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ConsultationSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  startsAt: string;       // ISO datetime
  durationMin: number;
  maxParticipants: number;
  bookedCount: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  slotId: string;
  studentId: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateSlotPayload {
  startsAt: string;
  durationMin?: number;
  maxParticipants?: number;
}
