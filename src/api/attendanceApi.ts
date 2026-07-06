import { apiClient } from './client';
import type {
  AttendanceManagerDto,
  AttendanceManagerListResponseDto,
  AttendanceUploadResultDto,
} from './dto/attendance.dto';

const getAttendanceRows = (
  response: AttendanceManagerDto[] | AttendanceManagerListResponseDto,
) => {
  if (Array.isArray(response)) return response;

  return (
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

export const attendanceApi = {
  uploadDeviceFile(
    file: File,
    period?: { year: number; month: number; week: number },
  ) {
    const formData = new FormData();
    formData.append('file', file);
    if (period) {
      formData.append('year', String(period.year));
      formData.append('month', String(period.month));
      formData.append('week', String(period.week));
    }

    return apiClient<string | AttendanceUploadResultDto>('/api/attend/manager/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async selectByPeriod(periodKey: string) {
    const response = await apiClient<
      AttendanceManagerDto[] | AttendanceManagerListResponseDto
    >(getSelectPath(periodKey));

    return getAttendanceRows(response);
  },

  modify(payload: AttendanceManagerDto) {
    return apiClient<string>('/api/attend/manager/modify', {
      method: 'POST',
      body: payload,
    });
  },

  deleteByEmployee(empNo: number | string) {
    return apiClient<string>(`/api/attend/manager/delete/${empNo}`, {
      method: 'POST',
    });
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

    return apiClient<string>(`/api/attend/manager/delete/emp_no?${params.toString()}`, {
      method: 'POST',
    });
  },
};
