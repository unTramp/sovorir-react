import { useConsultationStore } from '../../stores/useConsultationStore';
import { useAuthStore } from '../../stores/useAuthStore';
import type { ConsultationSlot } from '../../types/consultation';

interface Props {
  slot: ConsultationSlot;
}

function formatSlotTime(iso: string, durationMin: number): string {
  const start = new Date(iso);
  const end = new Date(start.getTime() + durationMin * 60 * 1000);
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const dateOpts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('ru-RU', dateOpts)}, ${start.toLocaleTimeString('ru-RU', timeOpts)}–${end.toLocaleTimeString('ru-RU', timeOpts)}`;
}

export function SlotCard({ slot }: Props) {
  const role = useAuthStore((s) => s.profile?.role);
  const { isBooked, bookSlot, cancelBooking } = useConsultationStore();

  const booked = isBooked(slot.id);
  const spotsLeft = slot.maxParticipants - slot.bookedCount;
  const isFull = spotsLeft <= 0 && !booked;
  const isIndividual = slot.maxParticipants === 1;

  const handleBook = () => void bookSlot(slot.id);
  const handleCancel = () => void cancelBooking(slot.id);

  return (
    <div className={`slot-card${booked ? ' slot-card--booked' : ''}`}>
      <div className="slot-card__header">
        <div className="slot-card__type">
          {isIndividual ? 'Индивидуальная' : 'Групповая'}
        </div>
        {booked && <span className="badge badge--accepted">Записаны</span>}
        {!booked && isFull && <span className="badge badge--review">Мест нет</span>}
      </div>

      <div className="slot-card__time">
        {formatSlotTime(slot.startsAt, slot.durationMin)}
      </div>

      <div className="slot-card__meta">
        <span className="slot-card__teacher">{slot.teacherName}</span>
        {!isIndividual && (
          <span className="slot-card__spots">
            {spotsLeft > 0 ? `${spotsLeft} из ${slot.maxParticipants} мест` : 'Мест нет'}
          </span>
        )}
        <span className="slot-card__duration">{slot.durationMin} мин</span>
      </div>

      {role === 'student' && (
        <div className="slot-card__actions">
          {booked ? (
            <button className="slot-card__btn slot-card__btn--cancel" onClick={handleCancel}>
              Отменить запись
            </button>
          ) : (
            <button
              className="slot-card__btn slot-card__btn--book"
              onClick={handleBook}
              disabled={isFull}
            >
              Записаться
            </button>
          )}
        </div>
      )}
    </div>
  );
}
