import { useEffect, useRef } from 'react';
import { lessons } from '../../data/lessons';

export function ProgressCircle() {
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const currentLesson = lessons.find((l) => l.status === 'current') || lessons[0];
  const totalSections = currentLesson.sections.length;
  const completedSections = currentLesson.sections.filter(
    (s) => s.status === 'completed',
  ).length;
  const inProgressSections = currentLesson.sections.filter(
    (s) => s.status === 'current' || s.status === 'in-progress',
  ).length;
  const percentage =
    totalSections > 0
      ? Math.round(((completedSections + inProgressSections * 0.5) / totalSections) * 100)
      : 0;

  useEffect(() => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    // Animate after a small delay
    const timer = setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = String(offset);
      }
      if (textRef.current) {
        textRef.current.textContent = `${percentage}%`;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="border-t border-border flex-shrink-0 px-6 pt-5 pb-6">
      <div style={{ position: 'relative', width: 115, height: 115, margin: '0 auto' }}>
        <svg
          viewBox="0 0 160 160"
          style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
        >
          <defs>
            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C47A62" />
              <stop offset="100%" stopColor="#9B5A4A" />
            </linearGradient>
          </defs>
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#8B746C"
            strokeOpacity="0.12"
            strokeWidth="8"
          />
          <circle
            ref={circleRef}
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#progressGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="440"
            strokeDashoffset="440"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div className="progress-star">{'\u2605'}</div>
          <div ref={textRef} className="progress-percent">
            0%
          </div>
        </div>
      </div>
      <div className="progress-hint">
        Завершите урок — получите <span className="progress-hint-star">{'\u2605'}</span>
      </div>
    </div>
  );
}
