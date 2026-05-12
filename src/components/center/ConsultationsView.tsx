import { useEffect, useState } from 'react';
import { useConsultationStore } from '../../stores/useConsultationStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { SlotCard } from '../consultations/SlotCard';

function groupByDate(slots: { startsAt: string; id: string }[]): [string, typeof slots][] {
  const groups: Record<string, typeof slots> = {};
  for (const slot of slots) {
    const dateKey = slot.startsAt.slice(0, 10);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(slot);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function formatDateHeader(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

type NewSlotState = { startsAt: string; durationMin: number; maxParticipants: number };

export function ConsultationsView() {
  const role = useAuthStore((s) => s.profile?.role);
  const { slots, isLoading, loadSlots, createSlot } = useConsultationStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewSlotState>({
    startsAt: '',
    durationMin: 60,
    maxParticipants: 1,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const handleCreate = async () => {
    if (!form.startsAt) return;
    setSaving(true);
    try {
      await createSlot(form);
      setShowForm(false);
      setForm({ startsAt: '', durationMin: 60, maxParticipants: 1 });
    } finally {
      setSaving(false);
    }
  };

  const grouped = groupByDate(slots);

  return (
    <div className="view-panel home-screen">
      <div className="home-greeting-section">
        <div className="consultations__header">
          <h1 className="assignments__title">Консультации</h1>
          {(role === 'teacher' || role === 'admin') && (
            <button
              className="assignment-card__submit-btn"
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? 'Отмена' : '+ Добавить слот'}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="slot-form">
          <label className="submit-modal__label">Дата и время</label>
          <input
            type="datetime-local"
            className="slot-form__input"
            value={form.startsAt}
            onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
          />
          <label className="submit-modal__label">Длительность (мин)</label>
          <input
            type="number"
            className="slot-form__input"
            value={form.durationMin}
            min={15}
            max={180}
            onChange={(e) => setForm((f) => ({ ...f, durationMin: Number(e.target.value) }))}
          />
          <label className="submit-modal__label">Макс. участников</label>
          <input
            type="number"
            className="slot-form__input"
            value={form.maxParticipants}
            min={1}
            max={20}
            onChange={(e) => setForm((f) => ({ ...f, maxParticipants: Number(e.target.value) }))}
          />
          <button
            className="submit-modal__btn submit-modal__btn--primary"
            onClick={() => void handleCreate()}
            disabled={!form.startsAt || saving}
          >
            {saving ? 'Сохранение...' : 'Создать слот'}
          </button>
        </div>
      )}

      {isLoading && slots.length === 0 && (
        <div className="assignments__loading">Загрузка...</div>
      )}

      {!isLoading && slots.length === 0 && (
        <div className="assignments__empty">
          <div className="assignments__empty-icon">📅</div>
          <p>Консультаций пока нет</p>
          {(role === 'teacher' || role === 'admin') && (
            <p className="assignments__empty-hint">Нажмите «+ Добавить слот», чтобы создать первую консультацию</p>
          )}
        </div>
      )}

      <div className="assignments__list">
        {grouped.map(([date, daySlots]) => (
          <div key={date} className="consultations__day-group">
            <div className="live-lesson-date">{formatDateHeader(date)}</div>
            {daySlots.map((slot) => (
              <SlotCard key={slot.id} slot={slot as Parameters<typeof SlotCard>[0]['slot']} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
