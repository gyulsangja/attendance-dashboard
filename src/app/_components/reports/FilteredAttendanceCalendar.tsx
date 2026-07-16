'use client';

import { WEEKDAYS, type FilteredAttendanceRow } from './hooks/useFilteredAttendanceReport';

type FilteredAttendanceCalendarProps = {
  rows: FilteredAttendanceRow[];
  year: number;
  month: number;
  startDate: string;
  endDate: string;
};

export default function FilteredAttendanceCalendar({
  rows,
  year,
  month,
  startDate,
  endDate,
}: FilteredAttendanceCalendarProps) {
  const toDate = (dateKey: string) => new Date(`${dateKey}T00:00:00`);
  const toDateKey = (date: Date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
  const addDays = (date: Date, days: number) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
  const start = toDate(startDate);
  const end = toDate(endDate);
  const visibleDates: Date[] = [];

  for (let current = start; current <= end; current = addDays(current, 1)) {
    visibleDates.push(current);
  }

  const eventsByDate = rows.reduce<Record<string, FilteredAttendanceRow[]>>((result, row) => {
    result[row.dateKey] = [...(result[row.dateKey] ?? []), row];
    return result;
  }, {});

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-7 bg-slate-50">
        {WEEKDAYS.map((weekday, index) => (
          <div
            key={weekday}
            className={`border-b border-r border-slate-200 py-3 text-center text-sm font-bold last:border-r-0 ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-slate-600'
            }`}
          >
            {weekday}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {visibleDates.map((date, index) => {
          const dateKey = toDateKey(date);
          const weekday = date.getDay();
          const cellMonth = date.getMonth() + 1;
          const day = date.getDate();
          const isSelectedMonth = date.getFullYear() === year && cellMonth === month;
          const dayLabel = isSelectedMonth ? String(day) : `${cellMonth}/${day}`;

          return (
            <div
              key={dateKey}
              className="min-h-32 border-b border-r border-slate-200 bg-white p-2 [&:nth-child(7n)]:border-r-0"
              style={{ gridColumnStart: index === 0 ? weekday + 1 : undefined }}
            >
              <div className={`mb-2 text-sm font-semibold ${
                weekday === 0 ? 'text-red-600' : weekday === 6 ? 'text-blue-600' : 'text-slate-600'
              }`}
              >
                {dayLabel}
              </div>
              <div className="space-y-1.5">
                {(eventsByDate[dateKey] ?? []).map((event) => {
                  const warning = ['LATE', 'EARLY_LEAVE', 'ABSENT', 'ATT02', 'ATT03', 'ATT04']
                    .includes(event.codeId);

                  return (
                    <div
                      key={event.id}
                      className={`rounded-md border-l-2 px-2 py-1.5 text-xs ${
                        warning
                          ? 'border-red-400 bg-red-50 text-red-800'
                          : 'border-slate-400 bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex justify-between gap-1">
                        <strong className="truncate">{event.name}</strong>
                        <span>{event.content}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
