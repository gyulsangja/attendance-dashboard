'use client';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import koLocale from '@fullcalendar/core/locales/ko';
import { shiftSchedules } from '@/mocks';

const shiftColor: Record<string, string> = {
  주간: '#64748b',
  야간: '#1e293b',
};

export default function ShiftWork() {
  const events = shiftSchedules
    .filter((schedule) => schedule.shift !== '휴무')
    .map((schedule) => ({
      id: String(schedule.id),
      title: `${schedule.shift === '주간' ? '주' : '야'} · ${schedule.name}`,
      date: schedule.date,
      backgroundColor: shiftColor[schedule.shift],
      borderColor: shiftColor[schedule.shift],
    }));

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        locales={[koLocale]}
        locale="ko"
        firstDay={0}
        events={events}
        height="auto"
        dayMaxEvents={2}
      />
    </div>
  );
}
