'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Chip, LinearProgress } from '@mui/material';
import {
  Badge,
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
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';

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
  const weekSchedules = management.schedules.filter(
    (schedule) => schedule.date >= startDate && schedule.date <= endDate,
  );
  const weekShifts = management.shifts.filter(
    (shift) => shift.date >= startDate && shift.date <= endDate,
  );
  const pendingShifts = weekShifts.filter((shift) => shift.status === '승인대기').length;

  const eventCounts = reportRecords
    .flatMap((record) => record.events)
    .reduce<Record<string, number>>((result, event) => {
      result[event.codeId] = (result[event.codeId] ?? 0) + 1;
      return result;
    }, {});

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

  const dashboardTeams = [
    ...organizationSnapshot.teams,
    ...(organizationSnapshot.employees.some(
      (employee) => employee.teamId === UNASSIGNED_TEAM_ID,
    ) ? [{
      id: UNASSIGNED_TEAM_ID,
      name: UNASSIGNED_TEAM_NAME,
      startDate: '1900-01-01',
    }] : []),
  ];
  const departmentStatus = dashboardTeams.map((team) => {
    const members = organizationSnapshot.employees.filter(
      (employee) => employee.teamId === team.id,
    );
    const memberIds = new Set(members.map((member) => member.id));
    const issues = reportRecords
      .filter((record) => memberIds.has(record.employeeId))
      .flatMap((record) => record.events)
      .filter((event) => exceptionalCodeIds.has(event.codeId)).length;

    return {
      id: team.id,
      name: team.name,
      members: members.length,
      issues,
    };
  });
  const maxIssues = Math.max(1, ...departmentStatus.map((item) => item.issues));
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
      value: management.csvUploaded ? `${workingRecords.length}건 확인` : '미입력',
      done: management.csvUploaded,
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

  const summaryCards = [
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
      label: '근태 발생',
      value: `${eventRows.length}건`,
      detail: confirmed ? '확정 데이터' : '미확정 주차',
      icon: <Badge />,
    },
    {
      label: '활성 근태코드',
      value: `${attendanceCodes.length}개`,
      detail: `${attendanceCodes.filter((code) => code.isSchedulable).length}개 일정 입력 가능`,
      icon: <Business />,
    },
  ];

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
          선택한 주차는 운영관리 확정 전입니다. 근태 통계는 표시되지 않으며,
          오른쪽 진행 현황에서 관리팀의 입력 상태를 확인할 수 있습니다.
        </Alert>
      )}

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-3 text-slate-600">{card.icon}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">주간 근태 요약</h2>
            <p className="mt-1 text-sm text-slate-500">
              설정에서 관리하는 전체 활성 근태코드 기준입니다.
            </p>
          </div>
          <Button component={Link} href="/reports" size="small">
            현황통계 상세 보기
          </Button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {attendanceCodes.map((code) => (
            <div key={code.id} className="rounded-lg bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: code.color }}
                />
                <span className="truncate text-sm font-semibold text-slate-500">
                  {code.label}
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold">{eventCounts[code.id] ?? 0}건</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold">부서별 근태 특이사항</h2>
              <p className="mt-1 text-sm text-slate-500">
                휴가성 일정을 제외한 지각·조퇴·결근 등의 발생 건수입니다.
              </p>
            </div>
            <Chip size="small" label={`${organizationSnapshot.teams.length}개 조직`} />
          </div>
          <div className="mt-5 space-y-4">
            {departmentStatus.map((department) => (
              <div key={department.id}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">{department.name}</span>
                  <span className="text-slate-500">
                    {department.members}명 · 특이사항 {department.issues}건
                  </span>
                </div>
                <LinearProgress
                  variant="determinate"
                  value={(department.issues / maxIssues) * 100}
                  sx={{
                    height: 7,
                    borderRadius: 4,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': { bgcolor: '#64748b' },
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        <DashboardOperationStatus items={operationItems} />
      </div>

      <div className="mt-5 grid gap-5 2xl:grid-cols-2">
        <DashboardEventGrid
          title="휴가·근무 일정"
          description="연차, 반차, 병가, 재택근무 등 확정된 일정입니다."
          rows={vacationRows}
        />
        <DashboardEventGrid
          title="확인할 근태 특이사항"
          description="경영진이 확인할 지각, 조퇴, 결근 등의 내역입니다."
          rows={exceptionRows}
        />
      </div>
    </main>
  );
}
