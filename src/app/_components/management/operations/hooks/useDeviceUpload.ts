'use client';

import { useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendanceApi';
import type {
  AttendanceRecord,
  OperationSchedule,
  ShiftSchedule,
  WorkTimePolicy,
} from '@/types/domain';
import { buildDeviceUploadRecords } from '@/lib/attendance/buildDeviceUploadRecords';
import {
  decodeCsvFile,
  parseAttendanceCsv,
  type AttendanceCsvError,
} from '@/lib/csv/parseAttendanceCsv';
import { invalidateAttendanceRecordQueries } from '@/hooks/useQueryInvalidation';
import { isApiDataSource } from '@/repositories/config';
import { useAppDispatch } from '@/store/hooks';
import { uploadDeviceRecords } from '@/store/slices/managementSlice';
import type { RootState } from '@/store/store';

type Week = {
  startDate: string;
  endDate: string;
};

type WeekDay = {
  date: string;
  label: string;
};

type Props = {
  deviceRecords: AttendanceRecord[];
  organization: RootState['organization'];
  policy: WorkTimePolicy;
  schedules: OperationSchedule[];
  shifts: ShiftSchedule[];
  week: Week;
  weekDays: WeekDay[];
};

export const useDeviceUpload = ({
  deviceRecords,
  organization,
  policy,
  schedules,
  shifts,
  week,
  weekDays,
}: Props) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const handleDeviceUpload = async (file: File) => {
    const isXlsx = file.name.toLowerCase().endsWith('.xlsx');

    if (isApiDataSource) {
      await attendanceApi.uploadDeviceFile(file);
      invalidateAttendanceRecordQueries(queryClient);

      if (isXlsx) {
        return {
          fileName: file.name,
          uploadedAt: new Date().toLocaleString('ko-KR'),
          startDate: week.startDate,
          endDate: week.endDate,
          totalRows: 0,
          validRows: 1,
          errorRows: 0,
          absenceRows: 0,
          errors: ['XLSX \ud30c\uc77c\uc740 \ubc31\uc5d4\ub4dc \uc5c5\ub85c\ub4dc\ub97c \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4. \uc870\ud68c API \uc751\ub2f5 \uae30\uc900\uc73c\ub85c \ud654\uba74\uc5d0 \ubc18\uc601\ub429\ub2c8\ub2e4.'],
        };
      }

      const parsed = parseAttendanceCsv(await decodeCsvFile(file));
      return {
        fileName: file.name,
        uploadedAt: new Date().toLocaleString('ko-KR'),
        startDate: week.startDate,
        endDate: week.endDate,
        totalRows: parsed.totalRows,
        validRows: parsed.rows.length,
        errorRows: parsed.errors.length,
        absenceRows: 0,
        errors: [
          '\ubc31\uc5d4\ub4dc \uc5c5\ub85c\ub4dc\ub97c \uc644\ub8cc\ud588\uc2b5\ub2c8\ub2e4. \uc870\ud68c API \uc751\ub2f5 \uae30\uc900\uc73c\ub85c \ud654\uba74\uc5d0 \ubc18\uc601\ub429\ub2c8\ub2e4.',
          ...parsed.errors.map((error: AttendanceCsvError) => `${error.row}\ud589: ${error.message}`),
        ],
      };
    }

    if (isXlsx) {
      return {
        fileName: file.name,
        uploadedAt: new Date().toLocaleString('ko-KR'),
        startDate: week.startDate,
        endDate: week.endDate,
        totalRows: 0,
        validRows: 0,
        errorRows: 1,
        absenceRows: 0,
        errors: ['XLSX \ud30c\uc77c\uc740 API \ubaa8\ub4dc\uc5d0\uc11c\ub9cc \uc5c5\ub85c\ub4dc\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4. \ubaa9\ub370\uc774\ud130 \ubaa8\ub4dc\uc5d0\uc11c\ub294 CSV \ud30c\uc77c\uc744 \uc0ac\uc6a9\ud574 \uc8fc\uc138\uc694.'],
      };
    }

    const parsed = parseAttendanceCsv(await decodeCsvFile(file));
    const { records, summary } = buildDeviceUploadRecords({
      parsed,
      fileName: file.name,
      period: {
        startDate: week.startDate,
        endDate: week.endDate,
      },
      weekDays,
      existingRecords: deviceRecords,
      schedules,
      shifts,
      organization,
      policy,
    });

    if (records.length > 0) {
      dispatch(uploadDeviceRecords({
        records,
        summary,
        startDate: week.startDate,
        endDate: week.endDate,
      }));
    }

    return summary;
  };

  return { handleDeviceUpload };
};

