'use client';

import type { OperationSchedule, ShiftSchedule } from '@/types/domain';
import { useInsertOperationSchedulesMutation } from '@/hooks/useOperationScheduleQueries';
import { isApiDataSource } from '@/repositories/config';
import { useAppDispatch } from '@/store/hooks';
import {
  addSchedules,
  addShifts,
  deletePendingShift,
  deleteSchedule,
  setOperationMonth,
  setOperationWeek,
  setOperationYear,
  toggleManagementConfirmed,
  updatePendingShift,
} from '@/store/slices/managementSlice';
import type { useDeviceRecordEditing } from './useDeviceRecordEditing';
import type { useDeviceUpload } from './useDeviceUpload';
import type { useScheduleEditing } from './useScheduleEditing';
import type { useShiftWeekActions } from './useShiftWeekActions';

type Props = {
  deviceEditing: ReturnType<typeof useDeviceRecordEditing>;
  deviceUpload: ReturnType<typeof useDeviceUpload>;
  scheduleEditing: ReturnType<typeof useScheduleEditing>;
  shiftWeekActions: ReturnType<typeof useShiftWeekActions>;
  week: {
    startDate: string;
    endDate: string;
  };
};

export const useManagementOperationActions = ({
  deviceEditing,
  deviceUpload,
  scheduleEditing,
  shiftWeekActions,
  week,
}: Props) => {
  const dispatch = useAppDispatch();
  const insertSchedulesMutation = useInsertOperationSchedulesMutation(week.startDate, week.endDate);

  return {
    addSchedules: async (items: OperationSchedule[]) => {
      if (isApiDataSource) {
        await insertSchedulesMutation.mutateAsync(items);
        return;
      }

      dispatch(addSchedules(items));
    },
    addShifts: (items: ShiftSchedule[]) => dispatch(addShifts(items)),
    deleteDeviceTime: deviceEditing.deleteDeviceTime,
    deletePendingShift: (id: number) => dispatch(deletePendingShift(id)),
    deleteSchedule: (id: number) => {
      if (isApiDataSource) return;
      dispatch(deleteSchedule(id));
    },
    handleDeviceUpload: deviceUpload.handleDeviceUpload,
    openTimeEditor: deviceEditing.openTimeEditor,
    saveDeviceTime: deviceEditing.saveDeviceTime,
    saveEditedSchedule: scheduleEditing.saveEditedSchedule,
    setOperationMonth: (value: number) => dispatch(setOperationMonth(value)),
    setOperationWeek: (value: number) => dispatch(setOperationWeek(value)),
    setOperationYear: (value: number) => dispatch(setOperationYear(value)),
    toggleConfirmed: () => dispatch(toggleManagementConfirmed()),
    toggleShiftWeekConfirmed: shiftWeekActions.toggleShiftWeekConfirmed,
    updatePendingShift: (shift: ShiftSchedule) => dispatch(updatePendingShift(shift)),
  };
};

export type ManagementOperationActions = ReturnType<typeof useManagementOperationActions>;
