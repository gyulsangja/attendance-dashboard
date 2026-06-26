'use client';

import { useState } from 'react';
import type { AttendanceRecord } from '@/types/domain';
import type { EditingTime } from '@/app/_components/management/operations/dialogs/TimeEditDialog';
import { useAppDispatch } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import {
  deleteDeviceRecord,
  saveDeviceRecord,
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
};

export const useDeviceRecordEditing = ({
  codeMaster,
  deviceRecords,
  organization,
}: Props) => {
  const dispatch = useAppDispatch();
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
      getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, date)
        .map((code) => code.id),
    );

    setEditingTime({
      employeeId,
      date,
      checkIn: record?.checkIn ?? '',
      checkOut: record?.checkOut ?? '',
      employeeName: employee?.name ?? '-',
      department,
      position: employee?.position ?? '-',
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
      getAttendanceCodesAtDate(codeMaster.codes, codeMaster.history, editingTime.date)
        .map((code) => [code.id, code.label]),
    );

    dispatch(saveDeviceRecord({
      ...editingTime,
      events: editingTime.attendanceCodeIds.flatMap((codeId) => {
        const label = validCodeMap.get(codeId);
        return label ? [{ codeId, detail: `관리팀 확인: ${label}` }] : [];
      }),
    }));
    setEditingTime(null);
  };

  const deleteDeviceTime = () => {
    if (!editingTime) return;

    dispatch(deleteDeviceRecord({
      employeeId: editingTime.employeeId,
      date: editingTime.date,
    }));
    setEditingTime(null);
  };

  return {
    editingTime,
    setEditingTime,
    openTimeEditor,
    saveDeviceTime,
    deleteDeviceTime,
  };
};
