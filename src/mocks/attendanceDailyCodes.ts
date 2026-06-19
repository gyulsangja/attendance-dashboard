export type AttendanceDailyCode = {
  id: number;
  attendanceDailyId: number;
  codeId: string;
  detail?: string;
};

export const attendanceDailyCodes: AttendanceDailyCode[] = [
  {
    id: 1,
    attendanceDailyId: 1,
    codeId: 'LATE',
    detail: '09:05 출근',
  },
  {
    id: 2,
    attendanceDailyId: 1,
    codeId: 'HALF_PM',
    detail: '오후 반차',
  },
];