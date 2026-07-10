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
  week: number;
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
    response.shiftinfolist ??
    response.shiftInfoList ??
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

const buildShiftRequestBody = (schedule: AttendManagerShiftScheduleDto) => {
  const payload = {
    work_date: schedule.work_date ?? schedule.workDate ?? schedule.date,
    emp_no: schedule.emp_no ?? schedule.empNo,
    shift_type: schedule.shift_type ?? schedule.shiftType,
    etc: schedule.etc ?? '',
  };

  return {
    newenshitfinfo: payload,
  };
};

const buildShiftModifyRequestBody = (schedule: AttendManagerShiftScheduleDto) => {
  const idx = schedule.idx ?? schedule.shift_schedule_id ?? schedule.shiftScheduleId;
  const workDate = schedule.work_date ?? schedule.workDate ?? schedule.date;
  const empNo = schedule.emp_no ?? schedule.empNo;
  const shiftType = schedule.shift_type ?? schedule.shiftType;

  const payload = {
    idx: idx === undefined || idx === null ? '' : String(idx),
    work_date: workDate ?? '',
    emp_no: empNo === undefined || empNo === null ? '' : String(empNo),
    shift_type: shiftType ?? '',
    etc: schedule.etc ?? '',
  };

  return {
    modifyshitfinfo: payload,
  };
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

  async getShiftMonth(params: AttendManagerMonthParams) {
    const response = await apiClient<
      AttendManagerShiftScheduleDto[] | AttendManagerShiftScheduleListResponseDto
    >('/api/employee/shiften/select', {
      method: 'POST',
      body: {
        shiftselectinfo: {
          select_type: '1',
          year: String(params.year),
          month: String(params.month),
          week: String(params.week),
        },
      },
    });

    return getShiftRows(response);
  },

  async saveShift(schedules: AttendManagerShiftScheduleDto[]) {
    for (const schedule of schedules) {
      await apiClient<string>('/api/employee/shiften/insert', {
        method: 'POST',
        body: buildShiftRequestBody(schedule),
      });
    }
  },

  modifyShift(schedule: AttendManagerShiftScheduleDto) {
    return apiClient<string>('/api/employee/shiften/modify', {
      method: 'POST',
      body: buildShiftModifyRequestBody(schedule),
    });
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

};



