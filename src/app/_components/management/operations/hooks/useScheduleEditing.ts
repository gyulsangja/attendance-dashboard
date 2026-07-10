import { useState } from 'react';
import type { AttendanceCode, OperationSchedule } from '@/types/domain';
import { useModifyOperationScheduleMutation } from '@/hooks/useOperationScheduleQueries';
import { isApiDataSource } from '@/repositories/config';
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
  const modifyScheduleMutation = useModifyOperationScheduleMutation();
  const [editingSchedule, setEditingSchedule] = useState<OperationSchedule | null>(null);

  const saveEditedSchedule = async () => {
    if (!editingSchedule) return;

    const code = attendanceCodes.find((item) => item.id === editingSchedule.codeId);
    const codeLabel = code?.label ?? editingSchedule.type ?? editingSchedule.codeId;
    const nextSchedule = {
      ...editingSchedule,
      type: codeLabel,
      detail: `${codeLabel} 일정`,
    };

    if (isApiDataSource) {
      await modifyScheduleMutation.mutateAsync(nextSchedule);
      setEditingSchedule(null);
      return;
    }

    if (!code) return;

    const snapshot = getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      editingSchedule.date,
    );
    const organizationEmployee = snapshot.employees.find(
      (item) => item.id === editingSchedule.employeeId,
    );
    if (!organizationEmployee) return;

    const department = organizationEmployee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : snapshot.teams.find((team) => team.id === organizationEmployee.teamId)?.name ?? '-';

    dispatch(updateSchedule({
      ...nextSchedule,
      department,
      name: organizationEmployee.name,
    }));
    setEditingSchedule(null);
  };

  return {
    editingSchedule,
    setEditingSchedule,
    saveEditedSchedule,
  };
};
