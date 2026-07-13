import type { HolidayType } from '@/types/domain';

export type KoreanPublicHoliday = {
  date: string;
  name: string;
  type: HolidayType;
};

// 프론트 목 환경에서 사용하는 대한민국 공휴일 달력입니다.
// 임시공휴일과 선거일은 정부 지정이 확정되면 이 목록에 추가합니다.
export const koreanPublicHolidays: KoreanPublicHoliday[] = [
  { date: '2025-01-01', name: '신정', type: 'PUBLIC' },
  { date: '2025-01-27', name: '임시공휴일', type: 'TEMPORARY' },
  { date: '2025-01-28', name: '설날 연휴', type: 'PUBLIC' },
  { date: '2025-01-29', name: '설날', type: 'PUBLIC' },
  { date: '2025-01-30', name: '설날 연휴', type: 'PUBLIC' },
  { date: '2025-03-01', name: '삼일절', type: 'PUBLIC' },
  { date: '2025-03-03', name: '삼일절 대체공휴일', type: 'SUBSTITUTE' },
  { date: '2025-05-05', name: '어린이날·부처님오신날', type: 'PUBLIC' },
  { date: '2025-05-06', name: '대체공휴일', type: 'SUBSTITUTE' },
  { date: '2025-06-03', name: '대통령 선거일', type: 'ELECTION' },
  { date: '2025-06-06', name: '현충일', type: 'PUBLIC' },
  { date: '2025-08-15', name: '광복절', type: 'PUBLIC' },
  { date: '2025-10-03', name: '개천절', type: 'PUBLIC' },
  { date: '2025-10-05', name: '추석 연휴', type: 'PUBLIC' },
  { date: '2025-10-06', name: '추석', type: 'PUBLIC' },
  { date: '2025-10-07', name: '추석 연휴', type: 'PUBLIC' },
  { date: '2025-10-08', name: '추석 대체공휴일', type: 'SUBSTITUTE' },
  { date: '2025-10-09', name: '한글날', type: 'PUBLIC' },
  { date: '2025-12-25', name: '성탄절', type: 'PUBLIC' },

  { date: '2026-01-01', name: '신정', type: 'PUBLIC' },
  { date: '2026-02-16', name: '설날 연휴', type: 'PUBLIC' },
  { date: '2026-02-17', name: '설날', type: 'PUBLIC' },
  { date: '2026-02-18', name: '설날 연휴', type: 'PUBLIC' },
  { date: '2026-03-01', name: '삼일절', type: 'PUBLIC' },
  { date: '2026-03-02', name: '삼일절 대체공휴일', type: 'SUBSTITUTE' },
  { date: '2026-05-05', name: '어린이날', type: 'PUBLIC' },
  { date: '2026-05-24', name: '부처님오신날', type: 'PUBLIC' },
  { date: '2026-05-25', name: '부처님오신날 대체공휴일', type: 'SUBSTITUTE' },
  { date: '2026-06-03', name: '전국동시지방선거일', type: 'ELECTION' },
  { date: '2026-06-06', name: '현충일', type: 'PUBLIC' },
  { date: '2026-08-15', name: '광복절', type: 'PUBLIC' },
  { date: '2026-08-17', name: '광복절 대체공휴일', type: 'SUBSTITUTE' },
  { date: '2026-09-24', name: '추석 연휴', type: 'PUBLIC' },
  { date: '2026-09-25', name: '추석', type: 'PUBLIC' },
  { date: '2026-09-26', name: '추석 연휴', type: 'PUBLIC' },
  { date: '2026-10-03', name: '개천절', type: 'PUBLIC' },
  { date: '2026-10-05', name: '개천절 대체공휴일', type: 'SUBSTITUTE' },
  { date: '2026-10-09', name: '한글날', type: 'PUBLIC' },
  { date: '2026-12-25', name: '성탄절', type: 'PUBLIC' },
];

const holidayMap = new Map(
  koreanPublicHolidays.map((holiday) => [holiday.date, holiday]),
);

export const getKoreanPublicHoliday = (date: string) =>
  holidayMap.get(date) ?? null;

export const isKoreanPublicHoliday = (date: string) =>
  holidayMap.has(date);
