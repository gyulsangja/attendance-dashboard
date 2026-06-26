'use client';

import { useState } from 'react';
import type { AttendanceCode, OperationSchedule } from '@/types/domain';
import { useAppDispatch } from '@/store/hooks';
import { updateSchedule } from '@/store/slices/managementSlice';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type { RootState } from '@/store/store';

type Props = {
  attendanceCodes: AttendanceCode[];
  organization: RootState['organization'];
};

export const useScheduleEditing = ({
  attendanceCodes,
  organization,
}: Props) => {
  const dispatch = useAppDispatch();
  const [editingSchedule, setEditingSchedule] = useState<OperationSchedule | null>(null);

  const saveEditedSchedule = () => {
    if (!editingSchedule) return;

    const snapshot = getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      editingSchedule.date,
    );
    const organizationEmployee = snapshot.employees.find(
      (item) => item.id === editingSchedule.employeeId,
    );
    const code = attendanceCodes.find((item) => item.id === editingSchedule.codeId);
    if (!organizationEmployee || !code) return;

    const department = organizationEmployee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : snapshot.teams.find((team) => team.id === organizationEmployee.teamId)?.name ?? '-';

    dispatch(updateSchedule({
      ...editingSchedule,
      department,
      name: organizationEmployee.name,
      type: code.label,
      detail: `${code.label} 입력`,
    }));
    setEditingSchedule(null);
  };

  return {
    editingSchedule,
    setEditingSchedule,
    saveEditedSchedule,
  };
};
