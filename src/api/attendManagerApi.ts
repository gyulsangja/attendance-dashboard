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
    response.shiftenlist ??
    response.shiftenList ??
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
      `/api/attend/manager/summary/${params.year}/${params.month}/${params.week}`,
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
    >('/api/employee/shiften/select/items', {
      method: 'POST',
      body: {
        select_type: '3',
        year: params.year,
        month: params.month,
      },
    });

    return getShiftRows(response);
  },

  async saveShift(schedules: AttendManagerShiftScheduleDto[]) {
    await Promise.all(
      schedules.map((schedule) =>
        apiClient<string>('/api/employee/shiften/insert', {
          method: 'POST',
          body: {
            work_date: schedule.work_date ?? schedule.workDate ?? schedule.date,
            emp_no: schedule.emp_no ?? schedule.empNo,
            shift_type: schedule.shift_type ?? schedule.shiftType,
            etc: schedule.etc ?? '',
          },
        })),
    );
  },

  deleteShift(shiftScheduleId: number | string) {
    return apiClient<string>(`/api/employee/shiften/delete/${shiftScheduleId}`, {
      method: 'POST',
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
