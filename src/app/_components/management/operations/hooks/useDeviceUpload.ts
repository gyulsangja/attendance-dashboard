'use client';

import { useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendanceApi';
import { adaptUploadResultToSummary } from '@/adapters/deviceUploadAdapter';
import { attendManagerRepository } from '@/repositories/attendManagerRepository';
import type { DeviceUploadSummary } from '@/types/domain';
import { invalidateAttendManagerQueries } from '@/hooks/useQueryInvalidation';
import { buildAttendanceWeekKey } from '@/lib/attendance/attendancePeriodKey';
import { queryKeys } from '@/lib/queryKeys';

type Week = {
  startDate: string;
  endDate: string;
};

type Props = {
  operationConfirmIdx?: number | string | null;
  year: number;
  month: number;
  weekNumber: number;
  week: Week;
};

const buildPendingSummary = (
  fileName: string,
  week: Week,
): DeviceUploadSummary => ({
  fileName,
  uploadedAt: new Date().toLocaleString('ko-KR'),
  startDate: week.startDate,
  endDate: week.endDate,
  totalRows: 0,
  validRows: 0,
  errorRows: 0,
  absenceRows: 0,
  errors: ['???? ???????. ?? ??? ??? ??? ?? ???? ?????.'],
});

export const useDeviceUpload = ({
  operationConfirmIdx,
  year,
  month,
  weekNumber,
  week,
}: Props) => {
  const queryClient = useQueryClient();

  const handleDeviceUpload = async (file: File) => {
    const uploadResult = await attendanceApi.uploadDeviceFile(file, { year, month, week: weekNumber });
    const weekKey = buildAttendanceWeekKey(year, month, weekNumber);

    await queryClient.invalidateQueries({ queryKey: queryKeys.attendanceRecordsBase });
    await queryClient.refetchQueries({ queryKey: queryKeys.attendanceRecords(weekKey) });
    await invalidateAttendManagerQueries(queryClient);

    return adaptUploadResultToSummary(uploadResult, {
      fileName: file.name,
      startDate: week.startDate,
      endDate: week.endDate,
    }) ?? buildPendingSummary(file.name, week);
  };

  const deleteDeviceUpload = async () => {
    const weekKey = buildAttendanceWeekKey(year, month, weekNumber);

    if (operationConfirmIdx === undefined || operationConfirmIdx === null || operationConfirmIdx === '') {
      throw new Error('??? ???? ?? ??? ????. ?? ??? ?? ??? ? ?????.');
    }

    await attendManagerRepository.deleteOperationWeekInfo(operationConfirmIdx);
    queryClient.setQueryData(queryKeys.attendanceRecords(weekKey), []);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.attendanceRecordsBase }),
      invalidateAttendManagerQueries(queryClient),
    ]);
  };

  return {
    deleteDeviceUpload,
    handleDeviceUpload,
  };
};
