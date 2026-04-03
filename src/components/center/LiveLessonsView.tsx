import { useEffect, useMemo, useState } from 'react';
import { contentRepository } from '../../lib/contentRepository';
import { LiveLessonCard } from '../live/LiveLessonCard';
import { ConversationClubCard } from '../live/ConversationClubCard';
import type { LiveLesson } from '../../types/liveLesson';
import type { ConversationClubSession } from '../../types/liveLesson';

type Tab = 'lessons' | 'club';

export function LiveLessonsView() {
  const [activeTab, setActiveTab] = useState<Tab>('lessons');
  const [upcoming, setUpcoming] = useState<LiveLesson[]>([]);
  const [clubs, setClubs] = useState<ConversationClubSession[]>([]);

  useEffect(() => {
    contentRepository.getLiveLessons().then(setUpcoming);
    contentRepository.getConversationClubs().then(setClubs);
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, LiveLesson[]> = {};
    for (const lesson of upcoming) {
      const dateKey = lesson.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(lesson);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [upcoming]);

  const groupedClubs = useMemo(() => {
    const groups: Record<string, ConversationClubSession[]> = {};
    for (const session of clubs) {
      const dateKey = session.date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(session);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [clubs]);

  // First non-full group lesson gets the "first free" badge
  const firstFreeId = useMemo(() => {
    for (const lesson of upcoming) {
      if (lesson.type === 'group' && lesson.spotsTotal - lesson.spotsTaken > 0) {
        return lesson.id;
      }
    }
    return null;
  }, [upcoming]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <div className="view-panel flex flex-col h-full">
      <div className="h-11 bg-content border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
        <span className="text-base font-semibold text-dark">Живые уроки</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Tabs */}
          <div className="live-events-tabs">
            <button
              className={`live-events-tabs__item ${activeTab === 'lessons' ? 'live-events-tabs__item--active' : ''}`}
              onClick={() => setActiveTab('lessons')}
            >
              Уроки
            </button>
            <button
              className={`live-events-tabs__item ${activeTab === 'club' ? 'live-events-tabs__item--active' : ''}`}
              onClick={() => setActiveTab('club')}
            >
              Клуб
            </button>
          </div>

          {activeTab === 'lessons' && (
            <>
              {/* Hero */}
              <div className="live-lessons-hero">
                <h1 className="live-lessons-hero__title">Живые уроки с Лусине</h1>
                <p className="live-lessons-hero__subtitle">
                  Практикуйте армянский в маленьких группах<br />
                  или запишитесь на индивидуальный урок
                </p>
              </div>

              {/* First lesson free banner */}
              {firstFreeId && (
                <div className="live-lessons-promo">
                  <span className="live-lessons-promo__badge">Бесплатно</span>
                  <div>
                    <div className="live-lessons-promo__title">Первый групповой урок бесплатно</div>
                    <div className="live-lessons-promo__subtitle">для новых учеников</div>
                  </div>
                </div>
              )}

              {grouped.length === 0 ? (
                <div className="text-center text-muted py-12">Нет предстоящих уроков</div>
              ) : (
                grouped.map(([date, lessons]) => (
                  <div key={date}>
                    <div className="live-lesson-date">{formatDate(date)}</div>
                    <div className="space-y-3">
                      {lessons.map((lesson) => (
                        <LiveLessonCard
                          key={lesson.id}
                          lesson={lesson}
                          isFirstFree={lesson.id === firstFreeId}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'club' && (
            <>
              {/* Club Hero */}
              <div className="club-hero">
                <h1 className="club-hero__title">Разговорный клуб с Лусине</h1>
                <p className="club-hero__subtitle">
                  Практикуйте армянский в неформальной обстановке.<br />
                  Одна тема, маленькая группа, живой разговор.
                </p>
              </div>

              {groupedClubs.length === 0 ? (
                <div className="text-center text-muted py-12">Нет предстоящих сессий</div>
              ) : (
                groupedClubs.map(([date, sessions]) => (
                  <div key={date}>
                    <div className="live-lesson-date">{formatDate(date)}</div>
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <ConversationClubCard
                          key={session.id}
                          session={session}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
