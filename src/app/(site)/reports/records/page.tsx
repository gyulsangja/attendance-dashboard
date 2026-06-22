'use client';

import { useMemo } from 'react';
import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { type ReportEmployee } from '@/mocks';
import { useAppSelector } from '@/store/hooks';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import { getKoreanPublicHoliday } from '@/lib/date';

type Status = 'normal' | 'late' | 'leave' | 'holiday' | 'warning';
type CellValue = { top: string; bottom?: string; status: Status };
type AttendanceEmployee = ReportEmployee & { shiftWorker: boolean };
const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
const styles: Record<Status, string> = { normal: 'bg-white text-slate-700', late: 'bg-white text-slate-700', leave: 'bg-slate-100 text-slate-700', holiday: 'bg-slate-50 text-slate-400', warning: 'bg-white text-slate-700' };

export default function Page() {
  const { year, month, startDate, endDate } = useAppSelector((state) => state.reportPeriod);
  const attendanceRecords = useAppSelector((state) => state.management.publishedRecords);
  const organization = useAppSelector((state) => state.organization);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const attendanceCodes = getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, endDate);
  const displayMonth = month === 'all' ? 6 : month;
  const days = useMemo(() => Array.from(
    { length: new Date(year, displayMonth, 0).getDate() },
    (_, index) => {
      const day = index + 1;
      const date = `${year}-${String(displayMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return {
        day,
        date,
        weekday: new Date(`${date}T00:00:00`).getDay(),
        holiday: getKoreanPublicHoliday(date),
      };
    },
  ), [year, displayMonth]);
  const monthlyRecords = useMemo(() => attendanceRecords.filter(
    (record) => record.date >= startDate && record.date <= endDate,
  ), [attendanceRecords, startDate, endDate]);
  const periodEmployees = useMemo(() => {
    const snapshot = getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      endDate,
    );
    return snapshot.employees.map<AttendanceEmployee>((employee) => ({
      id: employee.id,
      name: employee.name,
      department: employee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : snapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
      position: employee.position,
      shiftWorker: employee.shiftWorker,
    }));
  }, [organization, endDate]);
  const getCell = (employee: AttendanceEmployee, day: number): CellValue | undefined => {
    const date = `${year}-${String(displayMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const record = monthlyRecords.find((item) => item.employeeId === employee.id && item.date === date); if (!record) return undefined;
    const codes = record.events.map((event) => event.codeId); const labels = record.events.map((event) => attendanceCodes.find((code) => code.id === event.codeId)?.label ?? event.codeId);
    if (codes.includes('ABSENT')) return { top: '결근', status: 'warning' };
    if (codes.includes('ANNUAL') || codes.includes('SICK')) return { top: labels.join(', '), status: 'leave' };
    if (codes.includes('HALF_PM')) return {
      top: record.checkIn ? `${codes.includes('LATE') ? '지각' : '출근'} ${record.checkIn}` : '출근 미기록',
      bottom: record.checkOut ? `반차퇴근 ${record.checkOut}` : '퇴근 미기록',
      status: 'leave',
    };
    if (codes.includes('HALF_AM')) return {
      top: record.checkIn ? `반차출근 ${record.checkIn}` : '출근 미기록',
      bottom: record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록',
      status: 'leave',
    };
    if (codes.includes('REMOTE_WORK')) return {
      top: record.checkIn ? `재택 ${record.checkIn}` : '출근 미기록',
      bottom: record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록',
      status: 'normal',
    };
    if (codes.includes('EARLY_LEAVE')) return {
      top: record.checkIn ? `출근 ${record.checkIn}` : '출근 미기록',
      bottom: record.checkOut ? `조퇴 ${record.checkOut}` : '퇴근 미기록',
      status: 'warning',
    };
    if (codes.includes('LATE')) return {
      top: record.checkIn ? `지각 ${record.checkIn}` : '출근 미기록',
      bottom: record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록',
      status: 'late',
    };
    if (labels.length > 0) return {
      top: labels.join(', '),
      bottom: record.checkIn || record.checkOut
        ? `${record.checkIn ?? '-'} ~ ${record.checkOut ?? '-'}`
        : undefined,
      status: 'leave',
    };
    return {
      top: record.checkIn ? `출근 ${record.checkIn}` : '출근 미기록',
      bottom: record.checkOut ? `퇴근 ${record.checkOut}` : '퇴근 미기록',
      status: 'normal',
    };
  };

  return <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-bold">{year}년 {displayMonth}월 출퇴근기록</h2><p className="mt-1 text-sm text-slate-500">확정 당시의 직원·소속 정보를 기준으로 표시합니다.</p></div><div className="flex gap-2"><Chip size="small" label="휴가·반차" sx={{ bgcolor: '#f1f5f9', color: '#475569' }} /><Chip size="small" label="확인 필요" sx={{ bgcolor: '#fef2f2', color: '#b91c1c' }} /></div></div><TableContainer component={Paper} elevation={0} sx={{ maxHeight: 560, border: '1px solid #e2e8f0' }}><Table stickyHeader size="small" sx={{ minWidth: 3000, tableLayout: 'fixed', '& th, & td': { borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' } }}><TableHead><TableRow><TableCell sx={{ position: 'sticky', left: 0, zIndex: 4, width: 120, bgcolor: '#f8fafc', fontWeight: 800 }}>부서</TableCell><TableCell sx={{ position: 'sticky', left: 120, zIndex: 4, width: 100, bgcolor: '#f8fafc', fontWeight: 800 }}>이름</TableCell>{days.map(({ day, weekday, holiday }) => <TableCell key={day} align="center" sx={{ width: 86, p: 1, bgcolor: holiday || weekday === 0 ? '#fff1f2' : weekday === 6 ? '#eff6ff' : '#f8fafc', fontWeight: 800, color: holiday || weekday === 0 ? '#dc2626' : weekday === 6 ? '#2563eb' : '#334155' }}><div>{day}일</div><div className="text-[11px]">{holiday?.name ?? weekdays[weekday]}</div></TableCell>)}</TableRow></TableHead><TableBody>{periodEmployees.map((employee) => <TableRow key={`${employee.id}-${employee.department}`} hover><TableCell sx={{ position: 'sticky', left: 0, zIndex: 2, width: 120, bgcolor: 'white', fontWeight: 600 }}>{employee.department}</TableCell><TableCell sx={{ position: 'sticky', left: 120, zIndex: 2, width: 100, bgcolor: 'white', fontWeight: 800 }}>{employee.name}</TableCell>{days.map(({ day, weekday, holiday }) => { const regularRestDay = !employee.shiftWorker && (Boolean(holiday) || weekday === 0 || weekday === 6); const value = getCell(employee, day) ?? (regularRestDay ? { top: holiday?.name ?? '휴무', status: 'holiday' as Status } : undefined); return <TableCell key={day} align="center" className={value ? styles[value.status] : 'text-slate-300'} sx={{ height: 58, p: .5, bgcolor: regularRestDay ? holiday || weekday === 0 ? '#fff7f7' : '#f7faff' : undefined }}><div className="text-xs font-bold">{value?.top ?? '-'}</div>{value?.bottom && <div className="mt-1 text-[11px] opacity-75">{value.bottom}</div>}</TableCell>; })}</TableRow>)}</TableBody></Table></TableContainer><p className="mt-3 text-xs text-slate-400">표를 좌우로 스크롤하여 월 전체 기록을 확인할 수 있습니다.</p></section>;
}
