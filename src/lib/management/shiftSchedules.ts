import type { ShiftScheduleStatus } from '@/types/domain';

export const SHIFT_STATUS = {
  PENDING: '승인대기',
  CONFIRMED: '검토완료',
} as const satisfies Record<string, ShiftScheduleStatus>;
