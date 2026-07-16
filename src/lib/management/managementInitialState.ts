import { getPreviousWeekPeriod } from '@/lib/date';
import type { ManagementState } from '@/types/management';

export const buildInitialManagementState = (): ManagementState => {
  const defaultOperationWeek = getPreviousWeekPeriod();

  return {
    year: defaultOperationWeek.year,
    month: defaultOperationWeek.month,
    weekNumber: defaultOperationWeek.weekNumber,
    schedules: [],
    shifts: [],
    deviceRecords: [],
    publishedRecords: [],
    csvUploaded: false,
    deviceUpload: null,
    confirmed: false,
    confirmedWeekKeys: [],
  };
};
