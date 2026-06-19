export type AttendanceDaily = {
  id: number;
  employeeId: number;
  name: string;
  department: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  memo?: string;
  isAdjusted: boolean;
};

export const attendanceDaily: AttendanceDaily[] = [
  {
    id: 1,
    employeeId: 1,
    name: '홍길동',
    department: '기술팀',
    date: '2026-06-10',
    checkIn: '09:05',
    checkOut: '18:00',
    memo: '',
    isAdjusted: false,
  },
];