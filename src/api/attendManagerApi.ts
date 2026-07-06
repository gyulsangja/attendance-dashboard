import { apiClient } from './client';
import type {
  AttendManagerConfirmStatusDto,
  AttendManagerShiftScheduleDto,
  AttendManagerShiftScheduleListResponseDto,
  AttendManagerSummaryDto,
} from './dto/attendManager.dto';
import type { EmployeeAttendDto } from './dto/employee.dto';

export type AttendManagerWeekParams = {
  year: number;
  month: number;
  week: number;
};

export type AttendManagerMonthParams = {
  year: number;
  month: number;
};

const toParams = (params: Record<string, number | string>) =>
  new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((result, [key, value]) => {
      result[key] = String(value);
      return result;
    }, {}),
  ).toString();

const getShiftRows = (
  response: AttendManagerShiftScheduleDto[] | AttendManagerShiftScheduleListResponseDto,
) => {
  if (Array.isArray(response)) return response;

  return (
    response.shiftlist ??
    response.shiftList ??
    response.shift_schedule_list ??
    response.shiftScheduleList ??
    response.shift_schedules ??
    response.shiftSchedules ??
    response.schedules ??
    response.items ??
    response.rows ??
    response.list ??
    response.data ??
    response.result ??
    []
  );
};

const getSummary = (response: AttendManagerSummaryDto) =>
  response.data ?? response.summary ?? response.operation_summary ?? response.operationSummary ?? response;

const getConfirmStatus = (response: AttendManagerConfirmStatusDto) => {
  const nestedStatus = typeof response.status === 'object' ? response.status : undefined;
  return response.data ?? nestedStatus ?? response.confirm_status ?? response.confirmStatus ?? response;
};

export const attendManagerApi = {
  async getSummary(params: AttendManagerWeekParams) {
    const response = await apiClient<AttendManagerSummaryDto>(
      `/api/attend/manager/summary?${toParams(params)}`,
    );
    return getSummary(response);
  },

  async getOperationConfirmStatus(params: AttendManagerWeekParams) {
    const response = await apiClient<AttendManagerConfirmStatusDto>(
      `/api/attend/manager/confirm/status?${toParams(params)}`,
    );
    return getConfirmStatus(response);
  },

  async getShiftConfirmStatus(params: AttendManagerWeekParams) {
    const response = await apiClient<AttendManagerConfirmStatusDto>(
      `/api/attend/manager/shift/confirm/status?${toParams(params)}`,
    );
    return getConfirmStatus(response);
  },

  async getShiftMonth(params: AttendManagerMonthParams) {
    const response = await apiClient<
      AttendManagerShiftScheduleDto[] | AttendManagerShiftScheduleListResponseDto
    >(`/api/attend/manager/shift/month?${toParams(params)}`);

    return getShiftRows(response);
  },

  saveShift(schedules: AttendManagerShiftScheduleDto[]) {
    return apiClient<string>('/api/attend/manager/shift/save', {
      method: 'POST',
      body: { schedules },
    });
  },

  deleteShift(shiftScheduleId: number | string) {
    return apiClient<string>('/api/attend/manager/shift/delete', {
      method: 'POST',
      body: { shift_schedule_id: shiftScheduleId },
    });
  },

  confirmOperationWeek(params: AttendManagerWeekParams) {
    return apiClient<string>('/api/attend/manager/confirm', {
      method: 'POST',
      body: params,
    });
  },

  cancelOperationWeek(params: AttendManagerWeekParams) {
    return apiClient<string>('/api/attend/manager/confirm/cancel', {
      method: 'POST',
      body: params,
    });
  },

  deleteSchedule(schedule: EmployeeAttendDto) {
    return apiClient<string>('/api/attend/manager/schedule/delete', {
      method: 'POST',
      body: schedule,
    });
  },

  confirmShiftWeek(params: AttendManagerWeekParams) {
    return apiClient<string>('/api/attend/manager/shift/confirm', {
      method: 'POST',
      body: params,
    });
  },

  cancelShiftWeek(params: AttendManagerWeekParams) {
    return apiClient<string>('/api/attend/manager/shift/confirm/cancel', {
      method: 'POST',
      body: params,
    });
  },
};
