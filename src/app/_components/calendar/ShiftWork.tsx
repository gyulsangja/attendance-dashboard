"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import koLocale from "@fullcalendar/core/locales/ko";

type ShiftType = "DAY" | "NIGHT";

type ShiftSchedule = {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  shiftType: ShiftType;
};

const shiftLabel = {
  DAY: "주",
  NIGHT: "야",
};

const shiftColor = {
  DAY: "#999",
  NIGHT: "#2c3e50",
};

const schedules: ShiftSchedule[] = [
  { id: 1, employeeName: "김민수", date: "2026-05-01", shiftType: "DAY" },
  { id: 2, employeeName: "이서연", date: "2026-05-01", shiftType: "NIGHT" },

  { id: 3, employeeName: "박지훈", date: "2026-05-02", shiftType: "DAY" },
  { id: 4, employeeName: "최유진", date: "2026-05-02", shiftType: "NIGHT" },

  { id: 5, employeeName: "정도윤", date: "2026-05-03", shiftType: "DAY" },
  { id: 6, employeeName: "김민수", date: "2026-05-03", shiftType: "NIGHT" },

  { id: 7, employeeName: "정도윤", date: "2026-05-04", shiftType: "DAY" },
  { id: 8, employeeName: "김민수", date: "2026-05-04", shiftType: "NIGHT" },

  { id: 9, employeeName: "정도윤", date: "2026-05-05", shiftType: "DAY" },
  { id: 10, employeeName: "김민수", date: "2026-05-05", shiftType: "NIGHT" },

  { id: 11, employeeName: "정도윤", date: "2026-05-06", shiftType: "DAY" },
  { id: 12, employeeName: "김민수", date: "2026-05-06", shiftType: "NIGHT" },

  { id: 13, employeeName: "정도윤", date: "2026-05-07", shiftType: "DAY" },
  { id: 14, employeeName: "김민수", date: "2026-05-07", shiftType: "NIGHT" },
];

export default function ShiftWork() {
  const events = schedules.map((schedule) => ({
    id: String(schedule.id),
    title: `${shiftLabel[schedule.shiftType]} · ${schedule.employeeName}`,
    date: schedule.date,
    backgroundColor: shiftColor[schedule.shiftType],
    borderColor: shiftColor[schedule.shiftType],
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