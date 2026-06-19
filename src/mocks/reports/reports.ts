export type ReportRow = {
  id: number;
  date: string;
  displayDate: string;
  employeeId: number;
  name: string;
  department: string;
  codeId: string;
  contentDetail?: string;
  memo?: string;
};

export const reports: ReportRow[] = [
  {
    id: 1,
    date: '2026-06-08',
    displayDate: '2026-06-08(월)',
    employeeId: 1,
    name: '홍길동',
    department: '기술팀',
    codeId: 'LATE',
    contentDetail: '09:05 출근',
  },
  {
    id: 2,
    date: '2026-06-09',
    displayDate: '2026-06-09(화)',
    employeeId: 2,
    name: '김길동',
    department: '기술팀',
    codeId: 'ANNUAL',
    content: '연차',
  },
  {
    id: 3,
    date: '2026-06-10',
    displayDate: '2026-06-10(수)',
    employeeId: 3,
    name: '박길동',
    department: '개발팀',
    codeId: 'HALF_AM',
    content: '오전 반차',
  },
  {
    id: 4,
    date: '2026-06-11',
    displayDate: '2026-06-11(목)',
    employeeId: 1,
    name: '홍길동',
    department: '기술팀',
    codeId: 'EARLY_LEAVE',
    content: '조퇴',
    contentDetail: '17:10 퇴근',
  },
  {
    id: 5,
    date: '2026-06-12',
    displayDate: '2026-06-12(금)',
    employeeId: 4,
    name: '이길동',
    department: '경영관리팀',
    codeId: 'SICK',
    content: '병가',
  },
  {
    id: 6,
    date: '2026-06-15',
    displayDate: '2026-06-15(월)',
    employeeId: 5,
    name: '최길동',
    department: '전략영업부',
    codeId: 'OUTSIDE',
    content: '외근',
  },
  {
    id: 7,
    date: '2026-06-16',
    displayDate: '2026-06-16(화)',
    employeeId: 6,
    name: '정길동',
    department: '마케팅팀',
    codeId: 'EDUCATION',
    content: '교육',
  },
  {
    id: 8,
    date: '2026-06-17',
    displayDate: '2026-06-17(수)',
    employeeId: 2,
    name: '김길동',
    department: '기술팀',
    codeId: 'MISSING',
    content: '미기록',
    contentDetail: '퇴근 기록 없음',
  },
];