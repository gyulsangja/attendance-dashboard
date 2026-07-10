import type { ManagementState } from '@/types/management';
import {
  excludeItemsByPeriod,
  getOperationWeekKeyByDate,
  getOperationWeekPeriod,
} from './operationWeek';

export const getCurrentOperationWeek = (state: ManagementState) =>
  getOperationWeekPeriod(state.year, state.month, state.weekNumber);

export const isOperationWeekConfirmed = (state: ManagementState, date: string) => {
  const key = getOperationWeekKeyByDate(date);
  return Boolean(key && state.confirmedWeekKeys.includes(key));
};

export const syncConfirmedState = (state: ManagementState) => {
  const { key } = getCurrentOperationWeek(state);
  state.confirmed = state.confirmedWeekKeys.includes(key);
};

export const markCurrentWeekDirty = (state: ManagementState) => {
  const period = getCurrentOperationWeek(state);
  state.confirmedWeekKeys = state.confirmedWeekKeys.filter((item) => item !== period.key);
  state.publishedRecords = excludeItemsByPeriod(state.publishedRecords, period);
  state.confirmed = false;
};
