export type AttendanceCode = {
  id: string;
  label: string;
  color: string;
  isActive: boolean;
  isSchedulable: boolean;
  isExceptional: boolean;
  startDate: string;
  endDate?: string;
};

export const attendanceCodes: AttendanceCode[] = [
  { id: 'LATE', label: '지각', color: '#f97316', isActive: true, isSchedulable: false, isExceptional: true, startDate: '2024-01-01' },
  { id: 'EARLY_LEAVE', label: '조퇴', color: '#ec4899', isActive: true, isSchedulable: false, isExceptional: true, startDate: '2024-01-01' },
  { id: 'ABSENT', label: '결근', color: '#ef4444', isActive: true, isSchedulable: false, isExceptional: true, startDate: '2024-01-01' },
  { id: 'ANNUAL', label: '연차', color: '#3b82f6', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2024-01-01' },
  { id: 'HALF_AM', label: '오전반차', color: '#8b5cf6', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2024-01-01' },
  { id: 'HALF_PM', label: '오후반차', color: '#8b5cf6', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2024-01-01' },
  { id: 'SICK', label: '병가', color: '#64748b', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2024-01-01' },
  { id: 'REMOTE_WORK', label: '재택근무', color: '#10b981', isActive: true, isSchedulable: true, isExceptional: false, startDate: '2025-01-01' },
];
