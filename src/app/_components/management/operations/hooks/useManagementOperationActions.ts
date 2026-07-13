'use client';

import { useState } from 'react';
import type { OperationSchedule, ShiftSchedule } from '@/types/domain';
import {
  useCancelAttendManagerOperationWeekMutation,
  useConfirmAttendManagerOperationWeekMutation,
  useDeleteAttendManagerShiftMutation,
  useModifyAttendManagerShiftMutation,
  useSaveAttendManagerShiftsMutation,
} from '@/hooks/useAttendManagerQueries';
import {
  useDeleteOperationScheduleMutation,
  useInsertOperationSchedulesMutation,
} from '@/hooks/useOperationScheduleQueries';
import { isApiDataSource } from '@/repositories/config';
import type { OperationScheduleSaveResult } from '@/repositories/operationScheduleRepository';
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

type Props = {
  deviceEditing: ReturnType<typeof useDeviceRecordEditing>;
  deviceUpload: ReturnType<typeof useDeviceUpload>;
  scheduleEditing: ReturnType<typeof useScheduleEditing>;
  confirmed: boolean;
  schedules: OperationSchedule[];
  year: number;
  month: number;
  weekNumber: number;
};

export const useManagementOperationActions = ({
  deviceEditing,
  deviceUpload,
  scheduleEditing,
  confirmed,
  schedules,
  year,
  month,
  weekNumber,
}: Props) => {
  const dispatch = useAppDispatch();
  const [scheduleSaveResult, setScheduleSaveResult] = useState<OperationScheduleSaveResult | null>(null);
  const insertSchedulesMutation = useInsertOperationSchedulesMutation();
  const deleteScheduleMutation = useDeleteOperationScheduleMutation();
  const saveShiftsMutation = useSaveAttendManagerShiftsMutation();
  const modifyShiftMutation = useModifyAttendManagerShiftMutation();
  const deleteShiftMutation = useDeleteAttendManagerShiftMutation();
  const confirmOperationMutation = useConfirmAttendManagerOperationWeekMutation();
  const cancelOperationMutation = useCancelAttendManagerOperationWeekMutation();
  const isMutating = (
    insertSchedulesMutation.isPending ||
    deleteScheduleMutation.isPending ||
    saveShiftsMutation.isPending ||
    modifyShiftMutation.isPending ||
    deleteShiftMutation.isPending ||
    confirmOperationMutation.isPending ||
    cancelOperationMutation.isPending
  );
  const mutationError = [
    insertSchedulesMutation.error,
    deleteScheduleMutation.error,
    saveShiftsMutation.error,
    modifyShiftMutation.error,
    deleteShiftMutation.error,
    confirmOperationMutation.error,
    cancelOperationMutation.error,
  ].find(Boolean);

  return {
    scheduleSaveResult,
    apiMutationError: isApiDataSource && mutationError
      ? mutationError instanceof Error
        ? mutationError.message
        : '운영관리 API 처리 중 오류가 발생했습니다.'
      : '',
    apiMutating: isApiDataSource && isMutating,
    addSchedules: async (items: OperationSchedule[]) => {
      setScheduleSaveResult(null);
      if (isApiDataSource) {
        const result = await insertSchedulesMutation.mutateAsync(items);
        setScheduleSaveResult(result);
        return result;
      }

      dispatch(addSchedules(items));
      const result: OperationScheduleSaveResult = {
        totalCount: items.length,
        successCount: items.length,
        failureCount: 0,
        failures: [],
      };
      setScheduleSaveResult(result);
      return result;
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
    deleteDeviceUpload: deviceUpload.deleteDeviceUpload,
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
    updatePendingShift: async (shift: ShiftSchedule) => {
      if (isApiDataSource) {
        await modifyShiftMutation.mutateAsync(shift);
        return;
      }

      dispatch(updatePendingShift(shift));
    },
  };
};

export type ManagementOperationActions = ReturnType<typeof useManagementOperationActions>;
