'use client';

import { useState } from 'react';
import { useAccess } from '@/app/_components/auth/AccessProvider';
import { useAppSelector } from '@/store/hooks';
import { useDeviceUpload } from './hooks/useDeviceUpload';
import { useManagementDialogState } from './hooks/useManagementDialogState';
import { useManagementOperationActions } from './hooks/useManagementOperationActions';
import { useManagementOperationState } from './hooks/useManagementOperationState';
import { useShiftWeekActions } from './hooks/useShiftWeekActions';

export const useManagementOperations = () => {
  const access = useAccess();
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const state = useManagementOperationState();
  const [tab, setTab] = useState(0);
  const {
    deviceEditing,
    dialogs,
    scheduleEditing,
  } = useManagementDialogState({
    attendanceCodes: state.attendanceCodes,
    codeMaster,
    deviceRecords: state.deviceRecords,
    organization,
    week: state.week,
  });
  const deviceUpload = useDeviceUpload({
    deviceRecords: state.deviceRecords,
    year: state.year,
    month: state.month,
    weekNumber: state.weekNumber,
    organization,
    policy: codeMaster.workTimePolicy,
    schedules: state.displayedWeekSchedules,
    shifts: state.shifts,
    week: state.week,
    weekDays: state.weekDays,
  });
  const shiftWeekActions = useShiftWeekActions({
    shiftWeekConfirmed: state.shiftWeekConfirmed,
    year: state.year,
    month: state.month,
    weekNumber: state.weekNumber,
    week: state.week,
  });
  const actions = useManagementOperationActions({
    deviceEditing,
    deviceUpload,
    scheduleEditing,
    shiftWeekActions,
    confirmed: state.confirmed,
    schedules: state.displayedWeekSchedules,
    year: state.year,
    month: state.month,
    weekNumber: state.weekNumber,
    week: state.week,
  });

  return {
    access,
    actions,
    dialogs,
    setTab,
    state,
    tab,
  };
};

export type ManagementOperations = ReturnType<typeof useManagementOperations>;
