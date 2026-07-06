'use client';

import { useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendanceApi';
import { adaptUploadResultToSummary } from '@/adapters/deviceUploadAdapter';
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
} from '@/lib/csv/parseAttendanceCsv';
import {
  invalidateAttendManagerQueries,
  invalidateAttendanceRecordQueries,
} from '@/hooks/useQueryInvalidation';
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
  year: number;
  month: number;
  weekNumber: number;
  organization: RootState['organization'];
  policy: WorkTimePolicy;
  schedules: OperationSchedule[];
  shifts: ShiftSchedule[];
  week: Week;
  weekDays: WeekDay[];
};

export const useDeviceUpload = ({
  deviceRecords,
  year,
  month,
  weekNumber,
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
      const uploadResult = await attendanceApi.uploadDeviceFile(file, { year, month, week: weekNumber });
      invalidateAttendanceRecordQueries(queryClient);
      invalidateAttendManagerQueries(queryClient);
      const apiSummary = adaptUploadResultToSummary(uploadResult, {
        fileName: file.name,
        startDate: week.startDate,
        endDate: week.endDate,
      });
      if (apiSummary) return apiSummary;

      return {
        fileName: file.name,
        uploadedAt: new Date().toLocaleString('ko-KR'),
        startDate: week.startDate,
        endDate: week.endDate,
        totalRows: 0,
        validRows: 0,
        errorRows: 0,
        absenceRows: 0,
        errors: [
          '백엔드 업로드를 완료했습니다. 업로드 결과 건수는 백엔드 응답 기준으로 표시됩니다.',
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
        errors: ['XLSX 파일은 API 모드에서만 업로드할 수 있습니다. 목데이터 모드에서는 CSV 파일을 사용해 주세요.'],
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

