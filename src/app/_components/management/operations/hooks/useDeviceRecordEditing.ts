'use client';

import { useState } from 'react';
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import { useModifyAttendanceRecordMutation } from '@/hooks/useAttendanceRecordQueries';
import { isApiDataSource } from '@/repositories/config';
import type { AttendanceRecord } from '@/types/domain';
import type { EditingTime } from '@/app/_components/management/operations/dialogs/TimeEditDialog';
import { useAppDispatch } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import { saveDeviceRecord } from '@/store/slices/managementSlice';
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
};

export const useDeviceRecordEditing = ({
  codeMaster,
  deviceRecords,
  organization,
}: Props) => {
  const dispatch = useAppDispatch();
  const modifyRecordMutation = useModifyAttendanceRecordMutation();
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const [editingTime, setEditingTime] = useState<EditingTime | null>(null);

  const openTimeEditor = (employeeId: number, date: string) => {
    const record = deviceRecords.find(
      (item) => item.employeeId === employeeId && item.date === date,
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
        .map((code) => code.id),
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
    });
  };

  const saveDeviceTime = () => {
    if (!editingTime) return;

    const validCodeMap = new Map(
      (isApiDataSource
        ? apiAttendanceCodesQuery.data ?? []
        : getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, editingTime.date))
        .map((code) => [code.id, code.label]),
    );

    const events = editingTime.attendanceCodeIds.flatMap((codeId) => {
      const label = validCodeMap.get(codeId);
      return label ? [{ codeId, detail: `관리자 확인: ${label}` }] : [];
    });

    if (isApiDataSource) {
      void modifyRecordMutation.mutateAsync({
        id: editingTime.recordId ?? Number(`${editingTime.employeeId}${editingTime.date.replaceAll('-', '')}`),
        employeeId: editingTime.employeeId,
        employeeName: editingTime.employeeName ?? '-',
        department: editingTime.department ?? '-',
        position: editingTime.position ?? '-',
        date: editingTime.date,
        checkIn: editingTime.checkIn || undefined,
        checkOut: editingTime.checkOut || undefined,
        events,
      }).then(() => setEditingTime(null));
      return;
    }

    dispatch(saveDeviceRecord({
      ...editingTime,
      events,
    }));
    setEditingTime(null);
  };

  return {
    editingTime,
    setEditingTime,
    openTimeEditor,
    saveDeviceTime,
    isSaving: modifyRecordMutation.isPending,
    isError: modifyRecordMutation.isError,
  };
};

