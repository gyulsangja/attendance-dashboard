'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Chip } from '@mui/material';
import {
  Business,
  Groups,
  ManageAccounts,
} from '@mui/icons-material';
import DashboardEventGrid, {
  type DashboardEventRow,
} from '@/app/_components/dashboard/DashboardEventGrid';
import DashboardOperationStatus from '@/app/_components/dashboard/DashboardOperationStatus';
import DashboardPeriodHeader from '@/app/_components/dashboard/DashboardPeriodHeader';
import { getWeeksInMonth } from '@/lib/date';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import { getOrganizationSnapshot } from '@/store/slices/organizationSlice';

type DashboardEventWithCode = DashboardEventRow & { codeId: string };

export default function Home() {
  const management = useAppSelector((state) => state.management);
  const organization = useAppSelector((state) => state.organization);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const [year, setYear] = useState(management.year);
  const [month, setMonth] = useState(management.month);
  const [weekNumber, setWeekNumber] = useState(management.weekNumber);

  const weeks = useMemo(() => getWeeksInMonth(year, month), [year, month]);
  const selectedWeek = weeks.find((week) => week.week === weekNumber) ?? weeks[0];
  const startDate = selectedWeek?.startDate ?? `${year}-01-01`;
  const endDate = selectedWeek?.endDate ?? `${year}-01-07`;
  const weekKey = `${year}-${month}-${selectedWeek?.week ?? 1}`;
  const confirmed = management.confirmedWeekKeys.includes(weekKey);

  const attendanceCodes = useMemo(
    () => getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, endDate),
    [codeMaster, endDate],
  );
  const organizationSnapshot = useMemo(
    () => getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      endDate,
    ),
    [organization, endDate],
  );
  const reportRecords = management.publishedRecords.filter(
    (record) => record.date >= startDate && record.date <= endDate,
  );
  const workingRecords = management.deviceRecords.filter(
    (record) => record.date >= startDate && record.date <= endDate,
  );
  const terminalRecords = workingRecords.filter(
    (record) => Boolean(record.checkIn || record.checkOut),
  );
  const weekSchedules = management.schedules.filter(
    (schedule) => schedule.date >= startDate && schedule.date <= endDate,
  );
  const weekShifts = management.shifts.filter(
    (shift) => shift.date >= startDate && shift.date <= endDate,
  );
  const shiftCalendarDays = useMemo(() => {
    const days: Array<{ date: string; day: number; weekday: string }> = [];
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const end = new Date(`${endDate}T00:00:00`);
    for (
      const current = new Date(`${startDate}T00:00:00`);
      current <= end;
      current.setDate(current.getDate() + 1)
    ) {
      days.push({
        date: [
          current.getFullYear(),
          String(current.getMonth() + 1).padStart(2, '0'),
          String(current.getDate()).padStart(2, '0'),
        ].join('-'),
        day: current.getDate(),
        weekday: weekdays[current.getDay()],
      });
    }
    return days;
  }, [startDate, endDate]);
  const pendingShifts = weekShifts.filter((shift) => shift.status === '승인대기').length;

  const exceptionalCodeIds = new Set(
    attendanceCodes
      .filter((code) => code.isExceptional)
      .map((code) => code.id),
  );
  const eventRows: DashboardEventWithCode[] = reportRecords.flatMap((record) =>
    record.events.map((event, index) => ({
      id: `${record.id}-${index}`,
      date: record.date.slice(5).replace('-', '/'),
      department: record.department,
      name: record.employeeName,
      content: attendanceCodes.find((code) => code.id === event.codeId)?.label
        ?? event.codeId,
      detail: event.detail,
      codeId: event.codeId,
    })),
  );
  const vacationRows = eventRows.filter((row) =>
    !exceptionalCodeIds.has(row.codeId),
  );
  const exceptionRows = eventRows.filter((row) =>
    exceptionalCodeIds.has(row.codeId),
  );
  const eventCounts = reportRecords
    .flatMap((record) => record.events)
    .reduce<Record<string, number>>((result, event) => {
      result[event.codeId] = (result[event.codeId] ?? 0) + 1;
      return result;
    }, {});
  const checkInCount = reportRecords.filter((record) => record.checkIn).length;
  const summaryCards = [
    { label: '출근 기록', value: checkInCount },
    ...attendanceCodes
      .filter((code) => code.isExceptional)
      .map((code) => ({
        label: code.label,
        value: eventCounts[code.id] ?? 0,
      })),
  ];
  const detailAttendanceCodes = attendanceCodes.filter(
    (code) => !code.isExceptional,
  );

  const shiftWorkerCount = organizationSnapshot.employees.filter(
    (employee) => employee.shiftWorker,
  ).length;
  const operationItems = [
    {
      label: '근태 일정 입력',
      value: `${weekSchedules.length}건`,
      done: weekSchedules.length > 0,
    },
    {
      label: '단말기 출퇴근 데이터',
      value: terminalRecords.length > 0 ? `${terminalRecords.length}건 확인` : '업로드 필요',
      done: terminalRecords.length > 0,
    },
    {
      label: '교대근무 확정',
      value: pendingShifts > 0 ? `${pendingShifts}건 승인대기` : '확정 완료',
      done: pendingShifts === 0,
    },
    {
      label: '현황통계 반영',
      value: confirmed ? '반영 완료' : '확정 전',
      done: confirmed,
    },
  ];

  const companySummaryCards = [
    {
      label: '재직 인원',
      value: `${organizationSnapshot.employees.length}명`,
      detail: `${organizationSnapshot.teams.length}개 조직`,
      icon: <Groups />,
    },
    {
      label: '교대근무자',
      value: `${shiftWorkerCount}명`,
      detail: '직원 설정 기준',
      icon: <ManageAccounts />,
    },
    {
      label: '활성 근태코드',
      value: `${attendanceCodes.length}개`,
      detail: `${attendanceCodes.filter((code) => code.isSchedulable).length}개 일정 입력 가능`,
      icon: <Business />,
    },
  ];
  const statusOverview = (
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <DashboardOperationStatus items={operationItems} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">회사 현황</h2>
            <p className="mt-1 text-sm text-slate-500">
              조직과 구성원 기준의 기본 현황입니다.
            </p>
          </div>
          <Chip size="small" label={`${organizationSnapshot.teams.length}개 조직`} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {companySummaryCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">{card.value}</p>
                  <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
                </div>
                <div className="rounded-lg bg-white p-2 text-slate-500">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <main className="mx-auto max-w-[1800px]">
      <DashboardPeriodHeader
        year={year}
        month={month}
        weekNumber={selectedWeek?.week ?? 1}
        weeks={weeks}
        confirmed={confirmed}
        onYearChange={(value) => {
          setYear(value);
          setWeekNumber(1);
        }}
        onMonthChange={(value) => {
          setMonth(value);
          setWeekNumber(1);
        }}
        onWeekChange={setWeekNumber}
      />

      {!confirmed && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          선택한 주차는 운영관리 확정 전입니다. 확정 전에는 주간 근태 요약과 특이사항을 표시하지 않습니다.
        </Alert>
      )}

      {!confirmed && statusOverview}

      {confirmed && (
        <>
      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">주간 근태 요약</h2>
            <p className="mt-1 text-sm text-slate-500">
              {startDate} ~ {endDate} 확정 출퇴근 기록과 근태코드 발생 기준입니다.
            </p>
          </div>
          <Button component={Link} href="/reports" size="small">
            현황통계 상세 보기
          </Button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {summaryCards.map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-slate-50/60 px-5 py-4">
              <p className="text-sm font-semibold text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{item.value}건</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-600">근태코드별 발생</p>
        <p className="mt-1 text-xs text-slate-400">
          상단 특이근태를 제외한 근태코드 발생 건수를 코드별로 집계합니다.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
          {detailAttendanceCodes.map((code) => (
            <div key={code.id} className="rounded-lg border border-slate-100 px-3 py-3">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-slate-500">
                  {code.label}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold">{eventCounts[code.id] ?? 0}건</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-5 2xl:grid-cols-2">
        <DashboardEventGrid
          title="주간 근태 특이사항"
          description="선택 주차의 지각, 조퇴, 결근 등 확인이 필요한 확정 내역입니다."
          rows={exceptionRows}
        />
        <DashboardEventGrid
          title="주간 계획·특별 근태"
          description="선택 주차에 입력된 연차, 반차, 병가, 재택근무 등 특이 근태코드입니다."
          rows={vacationRows}
          showDetail={false}
        />
      </div>
        </>
      )}

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
            {shiftCalendarDays.map((day) => {
              const dayShifts = weekShifts
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
                      {day.day}일 ({day.weekday})
                    </span>
                  </div>
                  <div className="space-y-1.5 p-2">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className={`rounded-md border-l-3 px-2 py-1.5 ${
                          shift.shift === '야간'
                            ? 'border-indigo-500 bg-indigo-50'
                            : shift.shift === '오후'
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-emerald-500 bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <strong className="truncate text-xs text-slate-800">{shift.name}</strong>
                        </div>
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

      {confirmed && statusOverview}
    </main>
  );
}
