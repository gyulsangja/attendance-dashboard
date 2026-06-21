import { staffs } from '@/mocks/management/staffs';
import { organizationChanges } from '@/mocks/organization';

export type ReportEmployee = {
  id: number;
  name: string;
  department: string;
  position: string;
};

export type AttendanceEvent = {
  codeId: string;
  detail: string;
};

export type AttendanceRecord = {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  position: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  events: AttendanceEvent[];
  memo?: string;
};

export const reportEmployees: ReportEmployee[] = staffs.flatMap((team) =>
  team.staff.map((employee) => ({
    id: employee.id,
    name: employee.name,
    department: team.teamTitle,
    position: employee.position,
  })),
);

// 조직 변경 이력 예시입니다. 과거 근태는 현재 직원 마스터가 아니라
// 해당 날짜 당시의 소속 정보를 스냅샷으로 저장합니다.
export const getReportEmployeesForDate = (date: string): ReportEmployee[] =>
  reportEmployees.map((employee) => {
    const history = organizationChanges
      .filter((item) => item.employeeId === employee.id && item.effectiveDate <= date)
      .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];

    return {
      ...employee,
      department: history?.toDepartment ?? employee.department,
    };
  });

type AttendanceRecordInput = Omit<
  AttendanceRecord,
  'employeeName' | 'department' | 'position'
>;

const recordInputs: AttendanceRecordInput[] = [
  { id: 1, employeeId: 1, date: '2026-06-01', checkIn: '09:05', checkOut: '13:00', events: [{ codeId: 'LATE', detail: '09:05 출근' }, { codeId: 'HALF_PM', detail: '13:00 반차퇴근' }] },
  { id: 2, employeeId: 2, date: '2026-06-01', checkIn: '08:55', checkOut: '18:10', events: [] },
  { id: 3, employeeId: 4, date: '2026-06-02', events: [{ codeId: 'ANNUAL', detail: '연차 사용' }] },
  { id: 4, employeeId: 6, date: '2026-06-03', checkIn: '09:00', checkOut: '17:20', events: [{ codeId: 'EARLY_LEAVE', detail: '17:20 퇴근' }] },
  { id: 5, employeeId: 9, date: '2026-06-04', checkIn: '09:00', checkOut: '18:00', events: [{ codeId: 'REMOTE_WORK', detail: '종일 재택' }] },
  { id: 6, employeeId: 2, date: '2026-06-05', events: [{ codeId: 'ABSENT', detail: '미출근' }] },
  { id: 7, employeeId: 7, date: '2026-06-08', checkIn: '14:00', checkOut: '18:00', events: [{ codeId: 'HALF_AM', detail: '14:00 출근' }] },
  { id: 8, employeeId: 5, date: '2026-06-09', checkIn: '09:12', checkOut: '18:00', events: [{ codeId: 'LATE', detail: '09:12 출근' }] },
  { id: 9, employeeId: 11, date: '2026-06-10', checkIn: '09:00', checkOut: '18:00', events: [{ codeId: 'REMOTE_WORK', detail: '종일 재택' }] },
  { id: 10, employeeId: 10, date: '2026-06-11', events: [{ codeId: 'SICK', detail: '병가 사용' }] },
  { id: 11, employeeId: 3, date: '2026-06-12', checkIn: '08:58', checkOut: '18:04', events: [] },
  { id: 12, employeeId: 8, date: '2026-06-15', checkIn: '09:08', checkOut: '18:02', events: [{ codeId: 'LATE', detail: '09:08 출근' }] },
  { id: 13, employeeId: 12, date: '2026-06-16', checkIn: '09:00', checkOut: '13:00', events: [{ codeId: 'HALF_PM', detail: '13:00 반차퇴근' }] },
  { id: 14, employeeId: 1, date: '2026-06-17', checkIn: '08:54', checkOut: '18:03', events: [] },
  { id: 15, employeeId: 4, date: '2026-06-18', checkIn: '09:00', checkOut: '17:35', events: [{ codeId: 'EARLY_LEAVE', detail: '17:35 퇴근' }] },
  { id: 16, employeeId: 6, date: '2026-05-29', checkIn: '09:10', checkOut: '18:00', events: [{ codeId: 'LATE', detail: '09:10 출근' }] },
  { id: 17, employeeId: 9, date: '2026-05-28', events: [{ codeId: 'ANNUAL', detail: '연차 사용' }] },
  { id: 18, employeeId: 1, date: '2026-06-22', checkIn: '09:00', checkOut: '18:00', events: [] },
  { id: 19, employeeId: 7, date: '2026-06-23', checkIn: '09:00', checkOut: '18:10', events: [] },
  { id: 20, employeeId: 11, date: '2026-06-24', checkIn: '09:04', checkOut: '18:00', events: [{ codeId: 'LATE', detail: '09:04 출근' }] },
];

export const attendanceRecords: AttendanceRecord[] = recordInputs.map((record) => {
  const employee = getReportEmployeesForDate(record.date).find(
    (item) => item.id === record.employeeId,
  );

  return {
    ...record,
    employeeName: employee?.name ?? '-',
    department: employee?.department ?? '-',
    position: employee?.position ?? '-',
  };
});

export const getRecordsInPeriod = (startDate: string, endDate: string) =>
  attendanceRecords.filter((record) => record.date >= startDate && record.date <= endDate);

export const getReportEmployee = (employeeId: number) =>
  reportEmployees.find((employee) => employee.id === employeeId);
