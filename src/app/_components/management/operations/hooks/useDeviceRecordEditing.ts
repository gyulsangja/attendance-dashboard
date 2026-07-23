'use client';

import { useState } from 'react';
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import {
  useInsertAttendanceRecordMutation,
  useModifyAttendanceRecordMutation,
} from '@/hooks/useAttendanceRecordQueries';
import { getOperationWeekPeriodByDate } from '@/lib/management/operationWeek';
import {
  useDeleteOperationScheduleMutation,
  useInsertOperationSchedulesMutation,
  useModifyOperationScheduleMutation,
} from '@/hooks/useOperationScheduleQueries';
import { isApiDataSource } from '@/repositories/config';
import type { AttendanceRecord, OperationSchedule } from '@/types/domain';
import type { EditingTime } from '@/app/_components/management/operations/dialogs/TimeEditDialog';
import { useAppDispatch } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import {
  addSchedules,
  deleteSchedule,
  saveDeviceRecord,
  updateSchedule,
} from '@/store/slices/managementSlice';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type { RootState } from '@/store/store';

type Props = {
  codeMaster: RootState['attendanceCode'];
  deviceRecords: AttendanceRecord[];
  organization: RootState['organization'];
  schedules: OperationSchedule[];
};

export const useDeviceRecordEditing = ({
  codeMaster,
  deviceRecords,
  organization,
  schedules,
}: Props) => {
  const dispatch = useAppDispatch();
  const insertRecordMutation = useInsertAttendanceRecordMutation();
  const modifyRecordMutation = useModifyAttendanceRecordMutation();
  const insertSchedulesMutation = useInsertOperationSchedulesMutation();
  const modifyScheduleMutation = useModifyOperationScheduleMutation();
  const deleteScheduleMutation = useDeleteOperationScheduleMutation();
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const [editingTime, setEditingTime] = useState<EditingTime | null>(null);

  const openTimeEditor = (employeeId: number, date: string) => {
    const record = deviceRecords.find(
      (item) => String(item.employeeId) === String(employeeId) && item.date === date,
    );
    const snapshot = getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      date,
    );
    const employee = snapshot.employees.find((item) => item.id === employeeId);
    const department = employee?.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : snapshot.teams.find((team) => team.id === employee?.teamId)?.name ?? '-';
    const validCodeIds = new Set(
      (isApiDataSource
        ? apiAttendanceCodesQuery.data ?? []
        : getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, date))
        .filter((code) => !isApiDataSource || code.groupCode === 'G_ATTE_STATUS')
        .map((code) => code.id),
    );
    const daySchedules = schedules.filter(
      (schedule) => String(schedule.employeeId) === String(employeeId) && schedule.date === date,
    );

    setEditingTime({
      recordId: record?.id,
      employeeId,
      date,
      checkIn: record?.checkIn ?? '',
      checkOut: record?.checkOut ?? '',
      employeeName: record?.employeeName ?? employee?.name ?? '-',
      department: record?.department ?? department,
      position: record?.position ?? employee?.position ?? '-',
      attendanceCodeIds: [...new Set(
        record?.events
          .map((event) => event.codeId)
          .filter((codeId) => validCodeIds.has(codeId)) ?? [],
      )],
      schedules: daySchedules,
    });
  };

  const saveDeviceTime = () => {
    if (!editingTime) return;

    const validCodeMap = new Map(
      (isApiDataSource
        ? apiAttendanceCodesQuery.data ?? []
        : getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, editingTime.date))
        .filter((code) => !isApiDataSource || code.groupCode === 'G_ATTE_STATUS')
        .map((code) => [code.id, code.label]),
    );

    const events = editingTime.attendanceCodeIds.flatMap((codeId) => {
      const label = validCodeMap.get(codeId);
      return label ? [{ codeId, detail: `관리자 확인: ${label}` }] : [];
    });

    if (isApiDataSource) {
      const operationWeek = getOperationWeekPeriodByDate(editingTime.date);
      const recordPayload = {
        id: editingTime.recordId ?? Number(`${editingTime.employeeId}${editingTime.date.replaceAll('-', '')}`),
        year: operationWeek?.year,
        month: operationWeek?.month,
        week: operationWeek?.weekNumber,
        employeeId: editingTime.employeeId,
        employeeName: editingTime.employeeName ?? '-',
        department: editingTime.department ?? '-',
        position: editingTime.position ?? '-',
        date: editingTime.date,
        checkIn: editingTime.checkIn || undefined,
        checkOut: editingTime.checkOut || undefined,
        events,
      };
      const mutation = editingTime.recordId ? modifyRecordMutation : insertRecordMutation;

      void mutation.mutateAsync(recordPayload).then(() => setEditingTime(null));
      return;
    }

    dispatch(saveDeviceRecord({
      ...editingTime,
      events,
    }));
    setEditingTime(null);
  };

  const syncEditingSchedule = (schedule: OperationSchedule) => {
    setEditingTime((current) => {
      if (!current) return current;
      return {
        ...current,
        schedules: current.schedules.map((item) =>
          item.id === schedule.id ? schedule : item),
      };
    });
  };

  const modifyTimeSchedule = async (schedule: OperationSchedule) => {
    const code = (apiAttendanceCodesQuery.data ?? []).find((item) => item.id === schedule.codeId);
    const nextSchedule = {
      ...schedule,
      type: code?.label ?? schedule.type ?? schedule.codeId,
      detail: code?.label ?? schedule.detail,
    };

    if (isApiDataSource) {
      await modifyScheduleMutation.mutateAsync(nextSchedule);
      syncEditingSchedule(nextSchedule);
      return;
    }

    dispatch(updateSchedule(nextSchedule));
    syncEditingSchedule(nextSchedule);
  };

  const deleteTimeSchedule = async (schedule: OperationSchedule) => {
    if (isApiDataSource) {
      await deleteScheduleMutation.mutateAsync(schedule);
    } else {
      dispatch(deleteSchedule(schedule.id));
    }

    setEditingTime((current) => {
      if (!current) return current;
      return {
        ...current,
        schedules: current.schedules.filter((item) => item.id !== schedule.id),
      };
    });
  };

  const addTimeSchedule = async (codeId: string) => {
    if (!editingTime || !codeId) return;

    const code = (apiAttendanceCodesQuery.data ?? []).find((item) => item.id === codeId);
    const schedule: OperationSchedule = {
      id: Date.now(),
      date: editingTime.date,
      department: editingTime.department ?? '-',
      employeeId: editingTime.employeeId,
      employeeNo: String(editingTime.employeeId),
      name: editingTime.employeeName ?? '-',
      codeId,
      type: code?.label ?? codeId,
      detail: code?.label ?? '',
    };

    if (isApiDataSource) {
      const result = await insertSchedulesMutation.mutateAsync([schedule]);
      if (result.failureCount > 0) {
        throw new Error(result.failures[0]?.message ?? '근태정보 추가에 실패했습니다.');
      }
    } else {
      dispatch(addSchedules([schedule]));
    }

    setEditingTime((current) => {
      if (!current) return current;
      return {
        ...current,
        schedules: [...current.schedules, schedule],
      };
    });
  };

  return {
    editingTime,
    setEditingTime,
    openTimeEditor,
    saveDeviceTime,
    modifyTimeSchedule,
    deleteTimeSchedule,
    addTimeSchedule,
    isSaving: (
      modifyRecordMutation.isPending ||
      insertRecordMutation.isPending ||
      insertSchedulesMutation.isPending ||
      modifyScheduleMutation.isPending ||
      deleteScheduleMutation.isPending
    ),
    isError: (
      modifyRecordMutation.isError ||
      insertRecordMutation.isError ||
      insertSchedulesMutation.isError ||
      modifyScheduleMutation.isError ||
      deleteScheduleMutation.isError
    ),
  };
};

