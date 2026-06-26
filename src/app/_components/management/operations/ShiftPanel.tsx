'use client';

import koLocale from '@fullcalendar/core/locales/ko';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import {
  Alert,
  Button,
  Stack,
} from '@mui/material';
import type { ShiftSchedule } from '@/types/domain';

type ShiftPanelProps = {
  rows: ShiftSchedule[];
  year: number;
  month: number;
  selectedWeek: { startDate: string; endDate: string };
  confirmed: boolean;
  onAdd: () => void;
  onToggleConfirm: () => void;
  onEdit: (shift: ShiftSchedule) => void;
  canInput?: boolean;
  canApprove?: boolean;
};

const shiftColors: Record<string, string> = {
  '09:00 ~ 18:00': '#2563eb',
  '12:00 ~ 21:00': '#0f766e',
  '21:00 ~ 익일 09:00': '#4338ca',
};

const toDateKey = (date: Date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

const isInSelectedWeek = (
  date: string,
  selectedWeek: { startDate: string; endDate: string },
) => date >= selectedWeek.startDate && date <= selectedWeek.endDate;

export default function ShiftPanel({
  rows,
  year,
  month,
  selectedWeek,
  confirmed,
  onAdd,
  onToggleConfirm,
  onEdit,
  canInput = false,
  canApprove = false,
}: ShiftPanelProps) {
  const weekRows = rows.filter((item) => isInSelectedWeek(item.date, selectedWeek));
  const events = rows.map((schedule) => {
    const color = shiftColors[schedule.time] ?? '#475569';
    return {
      id: String(schedule.id),
      title: `${schedule.name} · ${schedule.time}`,
      date: schedule.date,
      backgroundColor: color,
      borderColor: color,
      textColor: '#ffffff',
      extendedProps: { time: schedule.time },
    };
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">{year}년 {month}월 교대근무 일정</h2>
          <p className="mt-1 text-sm text-slate-500">
            월간 일정은 달력으로 확인하고, 입력과 확정은 선택 주차 기준으로 처리합니다.
          </p>
        </div>
        <Stack direction="row" spacing={1}>
          {canInput && (
            <Button
              variant="contained"
              disabled={confirmed}
              onClick={onAdd}
              sx={{ bgcolor: '#0f172a' }}
            >
              선택 주차 일정 입력
            </Button>
          )}
          {canApprove && (
            <Button
              variant="contained"
              color={confirmed ? 'inherit' : 'primary'}
              disabled={weekRows.length === 0}
              onClick={onToggleConfirm}
              sx={{ bgcolor: confirmed ? '#475569' : '#0f172a', color: '#fff' }}
            >
              {confirmed ? '선택 주차 확정 취소' : '선택 주차 확정'}
            </Button>
          )}
        </Stack>
      </div>

      <Alert severity="info" sx={{ mb: 2 }}>
        선택 주차: {selectedWeek.startDate} ~ {selectedWeek.endDate}
        {canInput && !confirmed && ' · 일정을 클릭하면 수정하거나 삭제할 수 있습니다.'}
      </Alert>
      {confirmed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          선택 주차의 교대근무 일정이 확정되어 입력, 수정, 삭제할 수 없습니다. 일정을 변경하려면 먼저 확정을 취소하세요.
        </Alert>
      )}

      <div className="shift-month-calendar rounded-xl border border-slate-200 bg-white p-3">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          initialDate={`${year}-${String(month).padStart(2, '0')}-01`}
          headerToolbar={false}
          locales={[koLocale]}
          locale="ko"
          firstDay={0}
          fixedWeekCount={false}
          showNonCurrentDates
          events={events}
          height="auto"
          dayMaxEvents={4}
          dayCellClassNames={({ date }) => {
            const key = toDateKey(date);
            return isInSelectedWeek(key, selectedWeek)
              ? ['selected-operation-week']
              : [];
          }}
          eventDidMount={({ el, event }) => {
            el.title = event.title;
            if (canInput && !confirmed) {
              el.style.cursor = 'pointer';
            }
          }}
          eventClick={({ event }) => {
            const schedule = rows.find((item) => item.id === Number(event.id));
            if (!schedule) return;
            if (canInput && !confirmed) {
              onEdit(schedule);
            }
          }}
        />
      </div>
    </>
  );
}
