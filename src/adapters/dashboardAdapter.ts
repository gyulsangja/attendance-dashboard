import type {
  DashboardAttendanceCodeCountDto,
  DashboardAttendanceRecordDto,
  DashboardShiftScheduleDto,
  DashboardWeeklyDto,
} from '@/api/dto/dashboard.dto';
import { SHIFT_STATUS } from '@/lib/management/shiftSchedules';
import type { selectDashboardData } from '@/selectors/dashboardSelectors';
import type { AttendanceCode, ShiftSchedule } from '@/types/domain';

export type DashboardCompanyStatusView = {
  teamCount: number;
  employeeCount: number;
  shiftWorkerCount: number;
  activeAttendanceCodeCount: number;
};

export type DashboardViewModel = ReturnType<typeof selectDashboardData> & {
  companyStatus?: DashboardCompanyStatusView;
};

const toNumber = (value: unknown, fallback = 0) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const toBoolean = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  return ['Y', 'YES', 'TRUE', '1'].includes(String(value).trim().toUpperCase());
};

const formatShortDate = (date?: string) => {
  if (!date) return '';
  const [, month, day] = date.split('-');
  return month && day ? `${month}/${day}` : date;
};

const getRecordId = (record: DashboardAttendanceRecordDto, index: number) =>
  String(record.id ?? `${record.emp_no ?? record.empNo ?? 'emp'}-${record.work_date ?? record.workDate ?? record.date ?? index}-${index}`);

const shiftTimeByType: Record<string, { checkIn: string; checkOut: string }> = {
  SHIFT_DAY: { checkIn: '09:00', checkOut: '18:00' },
  SHIFT_NIGHT: { checkIn: '12:00', checkOut: '21:00' },
  SHIFT_DAWN: { checkIn: '21:00', checkOut: '09:00' },
};

const adaptRecordRow = (record: DashboardAttendanceRecordDto, index: number) => ({
  id: getRecordId(record, index),
  date: formatShortDate(record.work_date ?? record.workDate ?? record.date),
  department: record.dept_name ?? record.deptName ?? record.department ?? '',
  name: record.emp_name ?? record.empName ?? '',
  content: record.attendance_code_name ?? record.attendanceCodeName ?? record.attendance_code ?? record.attendanceCode ?? '',
  detail: record.detail ?? record.reason ?? '',
  codeId: record.attendance_code ?? record.attendanceCode ?? '',
});

const adaptShift = (shift: DashboardShiftScheduleDto, index: number): ShiftSchedule => {
  const shiftType = shift.shift_type ?? shift.shiftType ?? shift.shift_name ?? shift.shiftName ?? '';
  const shiftTime = shiftTimeByType[shiftType] ?? { checkIn: '', checkOut: '' };
  const startTime = shift.start_time ?? shift.startTime ?? shiftTime.checkIn;
  const endTime = shift.end_time ?? shift.endTime ?? shiftTime.checkOut;
  const isNextDay = Boolean(startTime && endTime && endTime <= startTime);
  const time = `${startTime}~${isNextDay ? '익일 ' : ''}${endTime}`;

  return {
    id: toNumber(shift.shift_schedule_id ?? shift.shiftScheduleId ?? shift.idx, index + 1),
    date: shift.work_date ?? shift.workDate ?? shift.date ?? '',
    employeeId: toNumber(shift.emp_no ?? shift.empNo, index + 1),
    name: shift.emp_name ?? shift.empName ?? '',
    shift: shiftType || time,
    time,
    status: SHIFT_STATUS.CONFIRMED,
    checkIn: startTime,
    checkOut: endTime,
  };
};

const adaptAttendanceCodeCount = (item: DashboardAttendanceCodeCountDto): AttendanceCode => ({
  id: item.attendance_code ?? item.attendanceCode ?? '',
  label: item.attendance_code_name ?? item.attendanceCodeName ?? item.attendance_code ?? item.attendanceCode ?? '',
  isActive: true,
  isExceptional: false,
  startDate: '2024-01-01',
});

export const adaptDashboardWeeklyDtoToViewModel = (
  dto: DashboardWeeklyDto,
  fallback: DashboardViewModel,
): DashboardViewModel => {
  const summaryCards = dto.summary_cards ?? dto.summaryCards;
  const exceptionRows = dto.exceptional_attendance_records ?? dto.exceptionalAttendanceRecords;
  const vacationRows = dto.weekly_attendance_plans ?? dto.weeklyAttendancePlans;
  const shifts = dto.shift_weekly_schedules ?? dto.shiftWeeklySchedules;
  const operationProgress = dto.operation_progress ?? dto.operationProgress;
  const companyStatus = dto.company_status ?? dto.companyStatus;
  const codeCounts = dto.attendance_code_counts ?? dto.attendanceCodeCounts;
  const summaryCodeIds = new Set(
    (summaryCards ?? [])
      .map((item) => item.attendance_code ?? item.attendanceCode)
      .filter(Boolean),
  );
  const detailCodeCounts = codeCounts?.filter((item) => {
    const code = item.attendance_code ?? item.attendanceCode;
    return !code || !summaryCodeIds.has(code);
  });

  const eventCounts = detailCodeCounts?.reduce<Record<string, number>>((result, item) => {
    const code = item.attendance_code ?? item.attendanceCode;
    if (code) result[code] = toNumber(item.count);
    return result;
  }, {});
  const operationItems = operationProgress?.items?.length
    ? operationProgress.items.map((item) => ({
      label: item.label ?? '',
      value: item.value ?? '',
      done: toBoolean(item.done),
    }))
    : operationProgress
      ? fallback.operationItems.map((item, index) => {
        if (index === 0) {
          const count = toNumber(
            operationProgress.attendance_schedule_count ?? operationProgress.attendanceScheduleCount,
          );
          return { ...item, value: `${count}건 입력`, done: count > 0 };
        }
        if (index === 1) {
          const count = toNumber(
            operationProgress.device_record_count ?? operationProgress.deviceRecordCount,
          );
          return { ...item, value: count > 0 ? `${count}건 확인` : '업로드 필요', done: count > 0 };
        }
        if (index === 2) {
          const rawCount = operationProgress.shift_schedule_count
            ?? operationProgress.shiftScheduleCount;
          if (rawCount === undefined || rawCount === null || rawCount === '') return item;
          const count = toNumber(rawCount);
          return { ...item, value: count > 0 ? `${count}건 등록` : '일정 없음', done: true };
        }
        if (index === 3) {
          const done = toBoolean(
            operationProgress.operation_confirmed ?? operationProgress.operationConfirmed,
            item.done,
          );
          return { ...item, value: done ? '확정 완료' : '확정 전', done };
        }
        return item;
      })
      : fallback.operationItems;

  return {
    ...fallback,
    startDate: dto.week_start_date ?? dto.weekStartDate ?? fallback.startDate,
    endDate: dto.week_end_date ?? dto.weekEndDate ?? fallback.endDate,
    confirmed: toBoolean(dto.operation_confirmed ?? dto.operationConfirmed, fallback.confirmed),
    summaryCards: summaryCards
      ? summaryCards.map((item) => ({
        label: item.label ?? item.attendance_code_name ?? item.attendanceCodeName ?? item.attendance_code ?? item.attendanceCode ?? '',
        value: toNumber(item.count ?? item.value),
      }))
      : fallback.summaryCards,
    exceptionRows: exceptionRows ? exceptionRows.map(adaptRecordRow) : fallback.exceptionRows,
    vacationRows: vacationRows ? vacationRows.map(adaptRecordRow) : fallback.vacationRows,
    weekShifts: shifts ? shifts.map(adaptShift) : fallback.weekShifts,
    operationItems,
    detailAttendanceCodes: codeCounts
      ? (detailCodeCounts ?? []).map(adaptAttendanceCodeCount).filter((code) => code.id)
      : fallback.detailAttendanceCodes,
    eventCounts: eventCounts ?? fallback.eventCounts,
    companyStatus: companyStatus
      ? {
        teamCount: toNumber(
          companyStatus.team_count ?? companyStatus.teamCount,
          fallback.companyStatus?.teamCount ?? fallback.organizationSnapshot.teams.length,
        ),
        employeeCount: toNumber(
          companyStatus.employee_count ?? companyStatus.employeeCount,
          fallback.companyStatus?.employeeCount ?? fallback.organizationSnapshot.employees.length,
        ),
        shiftWorkerCount: toNumber(
          companyStatus.shift_worker_count ?? companyStatus.shiftWorkerCount,
          fallback.companyStatus?.shiftWorkerCount ?? fallback.shiftWorkerCount,
        ),
        activeAttendanceCodeCount: toNumber(
          companyStatus.active_attendance_code_count ?? companyStatus.activeAttendanceCodeCount,
          fallback.companyStatus?.activeAttendanceCodeCount ?? fallback.attendanceCodes.length,
        ),
      }
      : fallback.companyStatus,
  };
};
