import type { ShiftScheduleStatus } from '@/types/domain';

export const SHIFT_STATUS = {
  PENDING: '승인대기',
  CONFIRMED: '확정',
} as const satisfies Record<string, ShiftScheduleStatus>;
