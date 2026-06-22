export type AttendanceCode = {
  id: string;
  label: string;
  isActive: boolean;
  isSchedulable: boolean;
  isExceptional: boolean;
  startDate: string;
  endDate?: string;
};

export const attendanceCodes: AttendanceCode[] = [
  { id: 'LATE', label: '지각', isActive: true, isSchedulable: false, isExceptional: true, startDate: '2024-01-01' },
  { id: 'EARLY_LEAVE', label: '조퇴', isActive: true, isSchedulable: false, isExceptional: true, startDate: '2024-01-01' },
  { id: 'ABSENT', label: '결근', isActive: true, isSchedulable: false, isExceptional: true, startDate: '2024-01-01' },
  { id: 'ANNUAL', label: '연차', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2024-01-01' },
  { id: 'HALF_AM', label: '오전반차', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2024-01-01' },
  { id: 'HALF_PM', label: '오후반차', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2024-01-01' },
  { id: 'SICK', label: '병가', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2024-01-01' },
  { id: 'REMOTE_WORK', label: '재택근무', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2025-01-01' },
];
