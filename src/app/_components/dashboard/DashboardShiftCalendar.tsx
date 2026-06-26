'use client';

import Link from 'next/link';
import { Button } from '@mui/material';
import type { ShiftSchedule } from '@/types/domain';

type ShiftCalendarDay = {
  date: string;
  day: number;
  weekday: string;
};

type DashboardShiftCalendarProps = {
  startDate: string;
  endDate: string;
  days: ShiftCalendarDay[];
  shifts: ShiftSchedule[];
};

const getShiftCardClassName = (time: string) => {
  if (time.startsWith('21:00')) return 'border-indigo-500 bg-indigo-50';
  if (time.startsWith('12:00')) return 'border-amber-500 bg-amber-50';
  return 'border-emerald-500 bg-emerald-50';
};

export default function DashboardShiftCalendar({
  startDate,
  endDate,
  days,
  shifts,
}: DashboardShiftCalendarProps) {
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold">교대근무자 주간 일정</h2>
          <p className="mt-1 text-sm text-slate-500">
            {startDate} ~ {endDate} 교대근무 일정입니다.
          </p>
        </div>
        <Button component={Link} href="/management" size="small">교대근무 관리</Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="grid min-w-[840px] grid-cols-7 overflow-hidden rounded-xl border border-slate-200">
          {days.map((day) => {
            const dayShifts = shifts
              .filter((shift) => shift.date === day.date)
              .sort((a, b) =>
                (a.checkIn ?? '').localeCompare(b.checkIn ?? '')
                || a.name.localeCompare(b.name));
            const weekendColor = day.weekday === '일'
              ? 'text-red-600'
              : day.weekday === '토' ? 'text-blue-600' : 'text-slate-700';

            return (
              <div
                key={day.date}
                className="min-h-36 border-r border-slate-200 bg-white last:border-r-0"
              >
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-center">
                  <span className={`text-sm font-bold ${weekendColor}`}>
                    {day.day}일({day.weekday})
                  </span>
                </div>
                <div className="space-y-1.5 p-2">
                  {dayShifts.map((shift) => (
                    <div
                      key={shift.id}
                      className={`rounded-md border-l-3 px-2 py-1.5 ${getShiftCardClassName(shift.time)}`}
                    >
                      <strong className="truncate text-xs text-slate-800">{shift.name}</strong>
                      <p className="mt-0.5 truncate text-[10px] text-slate-500">{shift.time}</p>
                    </div>
                  ))}
                  {dayShifts.length === 0 && (
                    <p className="py-4 text-center text-xs text-slate-300">일정 없음</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
