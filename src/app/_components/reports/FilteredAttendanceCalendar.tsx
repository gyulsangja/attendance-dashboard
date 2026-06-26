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
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
  const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
  const visibleStartDate = startDate > monthStart ? startDate : monthStart;
  const visibleEndDate = endDate < monthEnd ? endDate : monthEnd;
  const firstVisibleDay = Number(visibleStartDate.slice(8, 10));
  const lastVisibleDay = Number(visibleEndDate.slice(8, 10));
  const eventsByDay = rows.reduce<Record<number, FilteredAttendanceRow[]>>((result, row) => {
    const [rowYear, rowMonth, rowDay] = row.dateKey.split('-').map(Number);
    if (rowYear === year && rowMonth === month) {
      result[rowDay] = [...(result[rowDay] ?? []), row];
    }
    return result;
  }, {});
  const visibleDays = Array.from(
    { length: Math.max(lastVisibleDay - firstVisibleDay + 1, 0) },
    (_, index) => firstVisibleDay + index,
  );

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
        {visibleDays.map((day) => {
          const weekday = new Date(year, month - 1, day).getDay();
          return (
            <div
              key={day}
              className="min-h-32 border-b border-r border-slate-200 bg-white p-2 [&:nth-child(7n)]:border-r-0"
              style={{ gridColumnStart: visibleDays[0] === day ? weekday + 1 : undefined }}
            >
              <div className={`mb-2 text-sm font-semibold ${
                weekday === 0 ? 'text-red-600' : weekday === 6 ? 'text-blue-600' : 'text-slate-600'
              }`}
              >
                {day}
              </div>
              <div className="space-y-1.5">
                {(eventsByDay[day] ?? []).map((event) => {
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
                      <p className="mt-0.5 truncate text-[11px] opacity-70">{event.detail}</p>
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
