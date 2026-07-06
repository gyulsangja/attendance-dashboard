'use client';

import type { OperationSchedule, ShiftSchedule } from '@/types/domain';
import {
  useCancelAttendManagerOperationWeekMutation,
  useConfirmAttendManagerOperationWeekMutation,
  useDeleteAttendManagerShiftMutation,
  useSaveAttendManagerShiftsMutation,
} from '@/hooks/useAttendManagerQueries';
import {
  useDeleteOperationScheduleMutation,
  useInsertOperationSchedulesMutation,
} from '@/hooks/useOperationScheduleQueries';
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
  confirmed: boolean;
  schedules: OperationSchedule[];
  year: number;
  month: number;
  weekNumber: number;
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
  confirmed,
  schedules,
  year,
  month,
  weekNumber,
  week,
}: Props) => {
  const dispatch = useAppDispatch();
  const insertSchedulesMutation = useInsertOperationSchedulesMutation(week.startDate, week.endDate);
  const deleteScheduleMutation = useDeleteOperationScheduleMutation(week.startDate, week.endDate);
  const saveShiftsMutation = useSaveAttendManagerShiftsMutation();
  const deleteShiftMutation = useDeleteAttendManagerShiftMutation();
  const confirmOperationMutation = useConfirmAttendManagerOperationWeekMutation();
  const cancelOperationMutation = useCancelAttendManagerOperationWeekMutation();
  const isMutating = (
    insertSchedulesMutation.isPending ||
    deleteScheduleMutation.isPending ||
    saveShiftsMutation.isPending ||
    deleteShiftMutation.isPending ||
    confirmOperationMutation.isPending ||
    cancelOperationMutation.isPending
  );
  const mutationError = [
    insertSchedulesMutation.error,
    deleteScheduleMutation.error,
    saveShiftsMutation.error,
    deleteShiftMutation.error,
    confirmOperationMutation.error,
    cancelOperationMutation.error,
  ].find(Boolean);

  return {
    apiMutationError: isApiDataSource && mutationError
      ? mutationError instanceof Error
        ? mutationError.message
        : '운영관리 API 처리 중 오류가 발생했습니다.'
      : '',
    apiMutating: isApiDataSource && isMutating,
    addSchedules: async (items: OperationSchedule[]) => {
      if (isApiDataSource) {
        await insertSchedulesMutation.mutateAsync(items);
        return;
      }

      dispatch(addSchedules(items));
    },
    addShifts: async (items: ShiftSchedule[]) => {
      if (isApiDataSource) {
        await saveShiftsMutation.mutateAsync(items);
        return;
      }

      dispatch(addShifts(items));
    },
    deleteDeviceTime: deviceEditing.deleteDeviceTime,
    deletePendingShift: async (id: number) => {
      if (isApiDataSource) {
        await deleteShiftMutation.mutateAsync(id);
        return;
      }

      dispatch(deletePendingShift(id));
    },
    deleteSchedule: async (id: number) => {
      if (isApiDataSource) {
        const schedule = schedules.find((item) => item.id === id);
        if (schedule) await deleteScheduleMutation.mutateAsync(schedule);
        return;
      }
      dispatch(deleteSchedule(id));
    },
    handleDeviceUpload: deviceUpload.handleDeviceUpload,
    openTimeEditor: deviceEditing.openTimeEditor,
    saveDeviceTime: deviceEditing.saveDeviceTime,
    saveEditedSchedule: scheduleEditing.saveEditedSchedule,
    setOperationMonth: (value: number) => dispatch(setOperationMonth(value)),
    setOperationWeek: (value: number) => dispatch(setOperationWeek(value)),
    setOperationYear: (value: number) => dispatch(setOperationYear(value)),
    toggleConfirmed: async () => {
      if (isApiDataSource) {
        const params = { year, month, week: weekNumber };
        if (confirmed) {
          await cancelOperationMutation.mutateAsync(params);
        } else {
          await confirmOperationMutation.mutateAsync(params);
        }
        return;
      }

      dispatch(toggleManagementConfirmed());
    },
    toggleShiftWeekConfirmed: shiftWeekActions.toggleShiftWeekConfirmed,
    updatePendingShift: async (shift: ShiftSchedule) => {
      if (isApiDataSource) {
        await saveShiftsMutation.mutateAsync([shift]);
        return;
      }

      dispatch(updatePendingShift(shift));
    },
  };
};

export type ManagementOperationActions = ReturnType<typeof useManagementOperationActions>;
