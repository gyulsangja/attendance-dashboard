import { apiClient } from './client';
import type { AttendanceManagerDto, AttendanceManagerListResponseDto } from './dto/attendance.dto';
import type { DashboardShiftScheduleDto, DashboardWeeklyDto } from './dto/dashboard.dto';
import type { EmployeeAttendDto, EmployeeAttendListResponseDto } from './dto/employee.dto';

export type DashboardWeeklyParams = {
  year: number;
  month: number;
  week: number;
};

const unwrapDashboardWeekly = (response: DashboardWeeklyDto) =>
  response.data
  ?? response.result
  ?? response.dashboardinfo
  ?? response.dashboardInfo
  ?? response.dashboard
  ?? response.weekly_dashboard
  ?? response.weeklyDashboard
  ?? response;

const unwrapDashboardBlock = (
  response: DashboardWeeklyDto | unknown[],
  blockKey: 'shift_weekly_schedules',
): DashboardWeeklyDto => {
  const unwrapped = Array.isArray(response) ? response : unwrapDashboardWeekly(response as DashboardWeeklyDto);
  return Array.isArray(unwrapped)
    ? { [blockKey]: unwrapped as DashboardShiftScheduleDto[] }
    : unwrapped;
};

const getAttendanceRows = (
  response: AttendanceManagerDto[] | AttendanceManagerListResponseDto,
) => {
  if (Array.isArray(response)) return response;

  return response.attendinfo
    ?? response.attendInfo
    ?? response.attendanceList
    ?? response.attendancelist
    ?? response.attendweeklist
    ?? response.attendWeekList
    ?? response.items
    ?? response.rows
    ?? response.list
    ?? response.data
    ?? [];
};

const getEmployeeAttendRows = (
  response: EmployeeAttendDto[] | EmployeeAttendListResponseDto,
) => {
  if (Array.isArray(response)) return response;

  return response.attendancelist
    ?? response.attendanceList
    ?? response.employeeattendlist
    ?? response.employeeAttendList
    ?? response.attendlist
    ?? response.attendList
    ?? response.items
    ?? response.rows
    ?? response.list
    ?? response.data
    ?? [];
};

const getShiftRows = (response: DashboardWeeklyDto | DashboardShiftScheduleDto[] | Record<string, unknown>) => {
  if (Array.isArray(response)) return response;
  const source = response as Record<string, unknown> & DashboardWeeklyDto;

  return (source.shift_weekly_schedules
    ?? source.shiftWeeklySchedules
    ?? source.shiftinfolist
    ?? source.shiftInfoList
    ?? source.shiftenlist
    ?? source.shiftenList
    ?? source.shiftlist
    ?? source.shiftList
    ?? source.items
    ?? source.rows
    ?? source.list
    ?? source.data
    ?? []) as DashboardShiftScheduleDto[];
};

const toCount = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getRecordDate = (record: AttendanceManagerDto) =>
  record.attend_date ?? record.attendDate ?? record.attend_record_date ?? record.attendRecordDate ?? record.work_date ?? record.workDate ?? '';

const getRecordCode = (record: AttendanceManagerDto) =>
  record.attendance_code
  ?? record.attendanceCode
  ?? record.attend_code
  ?? record.attendCode
  ?? record.detail_code
  ?? record.detailCode
  ?? record.attend_status
  ?? record.attendStatus
  ?? '';

const getRecordCodeName = (record: AttendanceManagerDto) =>
  record.attend_code_name
  ?? record.attendCodeName
  ?? record.attendance_name
  ?? record.attendanceName
  ?? record.attend_status_name
  ?? record.attendStatusName
  ?? record.attend_reason
    ?? record.attendReason
    ?? getRecordCode(record);

const normalizeLabelKey = (value: unknown) =>
  String(value ?? '').trim().replace(/\s+/g, '').toUpperCase();

const isAbnormalAttendanceLabel = (code: unknown, name: unknown) => {
  const normalizedCode = normalizeLabelKey(code);
  const normalizedName = normalizeLabelKey(name);
  const target = `${normalizedCode}|${normalizedName}`;

  return [
    'LATE',
    'ABSENT',
    'MISSING',
    'NOCHECK',
    'UNCHECK',
    'ATT02',
    'ATT04',
    'ATT07',
    'ATT08',
    '지각',
    '결근',
    '미체크',
    '미기록',
  ].some((keyword) => target.includes(normalizeLabelKey(keyword)));
};

const isNormalAttendance = (record: AttendanceManagerDto) => {
  const code = String(getRecordCode(record)).trim().toUpperCase();
  const name = String(getRecordCodeName(record)).trim();

  return !code
    || ['ATT00', 'ATT01', 'NORMAL'].includes(code)
    || name.includes('정상출근');
};

void isNormalAttendance;

const adaptManagerRecord = (record: AttendanceManagerDto, index: number) => {
  const checkIn = record.check_in ?? record.checkIn ?? record.attendance_time ?? record.attendanceTime ?? '';
  const checkOut = record.check_out ?? record.checkOut ?? record.leave_working_time ?? record.leaveWorkingTime ?? '';

  return {
    id: String(record.idx ?? record.id ?? `${record.emp_no ?? record.empNo ?? index}-${getRecordDate(record)}-${index}`),
    work_date: getRecordDate(record),
    emp_no: record.emp_no ?? record.empNo ?? record.attend_card_no ?? record.attendCardNo,
    emp_name: record.emp_name ?? record.empName ?? '',
    dept_name: record.dept_name ?? record.deptName ?? '',
    attendance_code: getRecordCode(record),
    attendance_code_name: getRecordCodeName(record),
    detail: `${checkIn || '-'} / ${checkOut || '-'}`,
  };
};

const adaptEmployeeAttendRecord = (record: EmployeeAttendDto, index: number) => {
  const code = record.detail_code ?? record.detailCode ?? record.attend_code ?? record.attendCode ?? '';
  const codeName = record.attend_reason
    ?? record.attendReason
    ?? record.detail_code_name
    ?? record.detailCodeName
    ?? record.attend_code_name
    ?? record.attendCodeName
    ?? record.attend_name
    ?? record.attendName
    ?? code;

  return {
    id: String(record.idx ?? record.id ?? `${record.emp_no ?? record.empNo ?? index}-${record.attend_date ?? record.attendDate}-${index}`),
    work_date: record.attend_date ?? record.attendDate ?? '',
    emp_no: record.emp_no ?? record.empNo,
    emp_name: record.emp_name ?? record.empName ?? '',
    dept_name: record.dept_name ?? record.deptName ?? record.dept_code ?? record.deptCode ?? '',
    attendance_code: code,
    attendance_code_name: codeName,
    detail: record.etc ?? record.memo ?? record.remark ?? '',
  };
};

const getEmployeeAttendCode = (record: EmployeeAttendDto) =>
  record.detail_code ?? record.detailCode ?? record.attend_code ?? record.attendCode ?? '';

const getEmployeeAttendCodeName = (record: EmployeeAttendDto) =>
  record.attend_reason
  ?? record.attendReason
  ?? record.detail_code_name
  ?? record.detailCodeName
  ?? record.attend_code_name
  ?? record.attendCodeName
  ?? record.attend_name
  ?? record.attendName
  ?? getEmployeeAttendCode(record);

const isNormalEmployeeAttend = (record: EmployeeAttendDto) => {
  const code = String(record.detail_code ?? record.detailCode ?? record.attend_code ?? record.attendCode ?? '')
    .trim()
    .toUpperCase();
  const name = String(
    record.attend_reason
    ?? record.attendReason
    ?? record.detail_code_name
    ?? record.detailCodeName
    ?? record.attend_code_name
    ?? record.attendCodeName
    ?? record.attend_name
    ?? record.attendName
    ?? '',
  ).trim();

  return ['ATT00', 'ATT01', 'NORMAL'].includes(code) || name.includes('정상출근');
};

const adaptStatsDashToWeeklyDto = (dto: DashboardWeeklyDto): DashboardWeeklyDto => {
  const unwrapped = unwrapDashboardWeekly(dto);
  const attendanceCount = toCount(unwrapped.attendance_count ?? unwrapped.attendanceCount);
  const latenessCount = toCount(unwrapped.lateness_count ?? unwrapped.latenessCount);
  const earlyLeaveCount = toCount(unwrapped.early_leave_count ?? unwrapped.earlyLeaveCount);
  const absenceCount = toCount(unwrapped.from_work_count ?? unwrapped.fromWorkCount);
  const annualLeaveCount = toCount(unwrapped.day_off_count ?? unwrapped.dayOffCount);
  const morningHalfCount = toCount(unwrapped.morning_off_count ?? unwrapped.morningOffCount);
  const afternoonHalfCount = toCount(unwrapped.afternoon_off_count ?? unwrapped.afternoonOffCount);
  const shiftCount = toCount(unwrapped.shift_count ?? unwrapped.shiftCount);
  const directWorkCount = toCount(unwrapped.direct_work_count ?? unwrapped.directWorkCount);
  const directLeaveCount = toCount(unwrapped.direct_leave_count ?? unwrapped.directLeaveCount);

  const detailCounts = [
    { attendance_code: 'ATT02', attendance_code_name: '지각', count: latenessCount },
    { attendance_code: 'ATT03', attendance_code_name: '조퇴', count: earlyLeaveCount },
    { attendance_code: 'ATT04', attendance_code_name: '결근', count: absenceCount },
    { attendance_code: 'ATT05', attendance_code_name: '연차', count: annualLeaveCount },
    { attendance_code: 'ATT06_AM', attendance_code_name: '오전반차', count: morningHalfCount },
    { attendance_code: 'ATT06_PM', attendance_code_name: '오후반차', count: afternoonHalfCount },
    { attendance_code: 'SHIFT', attendance_code_name: '교대근무', count: shiftCount },
    { attendance_code: 'DIRECT_WORK', attendance_code_name: '직출', count: directWorkCount },
    { attendance_code: 'DIRECT_LEAVE', attendance_code_name: '직퇴', count: directLeaveCount },
  ];

  return {
    ...unwrapped,
    operation_confirmed: unwrapped.operation_confirmed ?? unwrapped.operationConfirmed,
    summary_cards: [
      {
        label: '출근 기록',
        attendance_code: 'GROUP_ATTENDANCE',
        attendance_code_name: '출근 기록',
        count: attendanceCount,
      },
      {
        label: '이상 근태',
        attendance_code: 'GROUP_EXCEPTION',
        attendance_code_name: '이상 근태',
        count: latenessCount + absenceCount,
      },
      {
        label: '휴가/반차',
        attendance_code: 'GROUP_LEAVE',
        attendance_code_name: '휴가/반차',
        count: annualLeaveCount + morningHalfCount + afternoonHalfCount,
      },
    ],
    attendance_code_counts: detailCounts,
  };
};

const getStatsDash = async (params: DashboardWeeklyParams) => {
  const response = await apiClient<DashboardWeeklyDto>(
    `/api/attend/manager/stats/dash/${params.year}/${params.month}/${params.week}`,
  );
  return adaptStatsDashToWeeklyDto(response);
};

const getWeeklyAttendanceSources = async (params: DashboardWeeklyParams) => {
  const [managerResponse, employeeAttendResponse] = await Promise.all([
    apiClient<AttendanceManagerDto[] | AttendanceManagerListResponseDto>(
      `/api/attend/manager/select/week/${params.year}/${params.month}/${params.week}`,
    ),
    apiClient<EmployeeAttendDto[] | EmployeeAttendListResponseDto>(
      '/api/employee/attend/select',
      {
        method: 'POST',
        body: {
          attendselectinfo: {
            select_type: '1',
            year: String(params.year),
            month: String(params.month),
            week: String(params.week),
          },
        },
      },
    ),
  ]);

  return {
    managerRows: getAttendanceRows(managerResponse),
    employeeAttendRows: getEmployeeAttendRows(employeeAttendResponse),
  };
};

const dedupeDashboardRecords = (records: ReturnType<typeof adaptManagerRecord>[]) => {
  const recordMap = new Map<string, ReturnType<typeof adaptManagerRecord>>();

  records.forEach((record) => {
    const key = [
      record.work_date,
      record.emp_no,
      normalizeLabelKey(record.attendance_code_name ?? record.attendance_code),
    ].join('|');
    if (!recordMap.has(key)) recordMap.set(key, record);
  });

  return [...recordMap.values()];
};

const getWeeklyExceptionalRecords = async (params: DashboardWeeklyParams): Promise<DashboardWeeklyDto> => {
  const { managerRows, employeeAttendRows } = await getWeeklyAttendanceSources(params);
  const exceptionalRecords = [
    ...managerRows
      .filter((record) => isAbnormalAttendanceLabel(getRecordCode(record), getRecordCodeName(record)))
      .map(adaptManagerRecord),
    ...employeeAttendRows
      .filter((record) => isAbnormalAttendanceLabel(getEmployeeAttendCode(record), getEmployeeAttendCodeName(record)))
      .map(adaptEmployeeAttendRecord),
  ];

  return { exceptional_attendance_records: dedupeDashboardRecords(exceptionalRecords) };
};

const getWeeklyPlans = async (params: DashboardWeeklyParams): Promise<DashboardWeeklyDto> => {
  const { managerRows, employeeAttendRows } = await getWeeklyAttendanceSources(params);
  const plannedRecords = [
    ...managerRows
      .filter((record) => !isNormalAttendance(record))
      .filter((record) => !isAbnormalAttendanceLabel(getRecordCode(record), getRecordCodeName(record)))
      .map(adaptManagerRecord),
    ...employeeAttendRows
      .filter((record) => !isNormalEmployeeAttend(record))
      .filter((record) => !isAbnormalAttendanceLabel(getEmployeeAttendCode(record), getEmployeeAttendCodeName(record)))
      .map(adaptEmployeeAttendRecord),
  ];

  return { weekly_attendance_plans: dedupeDashboardRecords(plannedRecords) };
};

export const dashboardApi = {
  getWeekly(params: DashboardWeeklyParams) {
    return getStatsDash(params);
  },
  getWeeklySummary(params: DashboardWeeklyParams) {
    return getStatsDash(params);
  },
  getWeeklyAttendanceCodeCounts(params: DashboardWeeklyParams) {
    return getStatsDash(params);
  },
  getWeeklyExceptionalRecords,
  getWeeklyPlans,
  async getWeeklyShiftSchedules(params: DashboardWeeklyParams) {
    const response = await apiClient<DashboardWeeklyDto | DashboardShiftScheduleDto[] | Record<string, unknown>>(
      '/api/employee/shiften/select',
      {
        method: 'POST',
        body: {
          shiftselectinfo: {
            select_type: '1',
            emp_no: '',
            shift_code: '',
            year: String(params.year),
            month: String(params.month),
            week: String(params.week),
          },
        },
      },
    );
    const rows = getShiftRows(response);
    return rows.length > 0
      ? { shift_weekly_schedules: rows }
      : unwrapDashboardBlock(response as DashboardWeeklyDto | DashboardShiftScheduleDto[], 'shift_weekly_schedules');
  },
};
