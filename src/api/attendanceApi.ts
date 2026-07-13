import { apiClient } from './client';
import type {
  AttendanceManagerDto,
  AttendanceManagerListResponseDto,
  AttendanceUploadResultDto,
  AttendanceUploadStatusDto,
} from './dto/attendance.dto';

const getAttendanceRows = (
  response: AttendanceManagerDto[] | AttendanceManagerListResponseDto,
) => {
  if (Array.isArray(response)) return response;

  return (
    response.attendinfo ??
    response.attendInfo ??
    response.attendanceList ??
    response.attendancelist ??
    response.attendweeklist ??
    response.attendWeekList ??
    response.attendmonthlist ??
    response.attendMonthList ??
    response.attendyearlist ??
    response.attendYearList ??
    response.employeelist ??
    response.attendManagerList ??
    response.attendmanagerlist ??
    response.items ??
    response.rows ??
    response.list ??
    response.data ??
    []
  );
};

const getSelectPath = (periodKey: string) => {
  const parts = periodKey.split('-').filter(Boolean);
  const [year, month, week] = parts;

  if (year && month && week) {
    return `/api/attend/manager/select/week/${Number(year)}/${Number(month)}/${Number(week)}`;
  }
  if (year && month) {
    return `/api/attend/manager/select/month/${Number(year)}/${Number(month)}`;
  }
  if (year) {
    return `/api/attend/manager/select/year/${Number(year)}`;
  }

  return `/api/attend/manager/select/${periodKey}`;
};

const toQueryString = (payload: Record<string, unknown>) => {
  const params = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  });

  return params.toString();
};

export const attendanceApi = {
  uploadDeviceFile(
    file: File,
    period?: { year: number; month: number; week: number },
  ) {
    const formData = new FormData();
    formData.append('file', file);

    const params = period
      ? `?${new URLSearchParams({
        year: String(period.year),
        month: String(period.month),
        week: String(period.week),
      }).toString()}`
      : '';

    return apiClient<string | AttendanceUploadResultDto>(`/api/attend/manager/upload${params}`, {
      method: 'POST',
      body: formData,
    });
  },

  getUploadStatus(year: number | string, month: number | string, week: number | string) {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
      week: String(week),
    });

    return apiClient<AttendanceUploadStatusDto>(`/api/attend/manager/upload/status?${params.toString()}`);
  },

  async selectByPeriod(periodKey: string) {
    const response = await apiClient<
      AttendanceManagerDto[] | AttendanceManagerListResponseDto
    >(getSelectPath(periodKey));

    return getAttendanceRows(response);
  },

  modify(payload: AttendanceManagerDto) {
    const query = toQueryString(payload as Record<string, unknown>);
    return apiClient<string>(`/api/attend/manager/modify${query ? `?${query}` : ''}`);
  },

  deleteByEmployee(idx: number | string) {
    return apiClient<string>(`/api/attend/manager/delete/emp_no/${idx}`);
  },

  deleteByWeek(year: number | string, month: number | string, week: number | string) {
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
      week: String(week),
    });

    return apiClient<string>(`/api/attend/manager/delete/week?${params.toString()}`, {
      method: 'POST',
    });
  },

  deleteByEmployeeWeek(
    empNo: number | string,
    year: number | string,
    month: number | string,
    week: number | string,
  ) {
    const params = new URLSearchParams({
      emp_no: String(empNo),
      year: String(year),
      month: String(month),
      week: String(week),
    });

    return apiClient<string>(`/api/attend/manager/delete/emp_no/${empNo}?${params.toString()}`);
  },
};

