'use client';

import { useState } from 'react';
import type {
  AttendanceCode,
  AttendanceRecord,
  ShiftSchedule,
} from '@/types/domain';
import type { RootState } from '@/store/store';
import { useDeviceRecordEditing } from './useDeviceRecordEditing';
import { useScheduleEditing } from './useScheduleEditing';

type Props = {
  attendanceCodes: AttendanceCode[];
  codeMaster: RootState['attendanceCode'];
  deviceRecords: AttendanceRecord[];
  organization: RootState['organization'];
};

export const useManagementDialogState = ({
  attendanceCodes,
  codeMaster,
  deviceRecords,
  organization,
}: Props) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftSchedule | null>(null);
  const scheduleEditing = useScheduleEditing({ attendanceCodes, organization });
  const deviceEditing = useDeviceRecordEditing({
    codeMaster,
    deviceRecords,
    organization,
  });

  return {
    deviceEditing,
    scheduleEditing,
    dialogs: {
      editingSchedule: scheduleEditing.editingSchedule,
      editingShift,
      editingTime: deviceEditing.editingTime,
      scheduleOpen,
      shiftOpen,
      setEditingSchedule: scheduleEditing.setEditingSchedule,
      setEditingShift,
      setEditingTime: deviceEditing.setEditingTime,
      setScheduleOpen,
      setShiftOpen,
    },
  };
};

export type ManagementDialogState = ReturnType<typeof useManagementDialogState>['dialogs'];
