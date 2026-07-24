import { ApiError, apiClient } from './client';
import type {
  AttendManagerConfirmStatusDto,
  AttendManagerConfirmStatusListResponseDto,
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

export type AttendManagerSendMailItem = {
  empNo: string;
  attendDate: string;
  email: string;
  attendCode: string;
  mailType?: 1 | 2;
  mailMessage?: string;
};

const buildSendMailRequestBody = (items: AttendManagerSendMailItem[]) => ({
  sendmaillist: items.map((item) => ({
    emp_no: item.empNo,
    attend_date: item.attendDate,
    email: item.email,
    attend_code: item.attendCode,
    mail_type: item.mailType ?? 1,
    mail_message: item.mailMessage ?? '',
  })),
});

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
  response.data
  ?? response.summary
  ?? response.operationalstatisticsinfo
  ?? response.operationalStatisticsInfo
  ?? response.operation_summary
  ?? response.operationSummary
  ?? response;

const getConfirmStatus = (response: AttendManagerConfirmStatusDto) => {
  const nestedStatus = typeof response.status === 'object' ? response.status : undefined;
  return response.data
    ?? nestedStatus
    ?? response.operationconfirm
    ?? response.operationConfirm
    ?? response.confirmstatus
    ?? response.confirmStatusResult
    ?? response.confirm_status
    ?? response.confirmStatus
    ?? response;
};

const getConfirmStatusRows = (
  response: AttendManagerConfirmStatusDto[] | AttendManagerConfirmStatusListResponseDto,
) => {
  if (Array.isArray(response)) return response;

  return response.confirmstatuslist
    ?? response.confirmStatusList
    ?? response.items
    ?? response.rows
    ?? response.list
    ?? response.data
    ?? [];
};

const buildWeekRequestBody = (params: AttendManagerWeekParams) => ({
  confirmstatusinfo: {
    year: String(params.year),
    month: String(params.month),
    week: String(params.week),
  },
});

const buildShiftRequestBody = (schedule: AttendManagerShiftScheduleDto) => {
  const payload = {
    work_date: schedule.work_date ?? schedule.workDate ?? schedule.date ?? '',
    emp_no: schedule.emp_no ?? schedule.empNo ?? '',
    shift_type: schedule.shift_type ?? schedule.shiftType ?? '',
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
      '/api/attend/manager/confirm/status',
      {
        method: 'POST',
        body: buildWeekRequestBody(params),
      },
    );
    return getConfirmStatus(response);
  },

  async getOperationConfirmStatusList(params: AttendManagerMonthParams) {
    const searchParams = new URLSearchParams({
      year: String(params.year),
      month: String(params.month),
    });
    const response = await apiClient<
      AttendManagerConfirmStatusDto[] | AttendManagerConfirmStatusListResponseDto
    >(`/api/attend/manager/confirm/status/list?${searchParams.toString()}`, {
      method: 'POST',
    });
    return getConfirmStatusRows(response);
  },

  async getShiftMonth(params: AttendManagerMonthParams) {
    const response = await apiClient<
      AttendManagerShiftScheduleDto[] | AttendManagerShiftScheduleListResponseDto
    >('/api/employee/shiften/select', {
      method: 'POST',
      body: {
        shiftselectinfo: {
          select_type: '1',
          emp_no: '',
          shift_code: '',
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
    return apiClient<string>('/api/attend/manager/confirm/submit', {
      method: 'POST',
      body: buildWeekRequestBody(params),
    });
  },

  cancelOperationWeek(params: AttendManagerWeekParams) {
    return apiClient<string>('/api/attend/manager/confirm/cancel', {
      method: 'POST',
      body: buildWeekRequestBody(params),
    });
  },

  deleteOperationWeekInfo(idx: number | string) {
    return apiClient<string>(`/api/attend/manager/confirm/delete/${idx}`, {
      method: 'POST',
      headers: { Accept: 'text/plain' },
    });
  },

  deleteSchedule(schedule: EmployeeAttendDto) {
    return apiClient<string>('/api/attend/manager/schedule/delete', {
      method: 'POST',
      body: schedule,
    });
  },

  async sendMail(items: AttendManagerSendMailItem[]) {
    const response = await apiClient<unknown>('/api/attend/manager/mail/sendmail', {
      method: 'POST',
      headers: { Accept: 'text/plain' },
      body: buildSendMailRequestBody(items),
    });

    const message = typeof response === 'string'
      ? response.trim()
      : response && typeof response === 'object'
        ? String((response as Record<string, unknown>).message ?? '')
        : '';

    if (!message.includes('성공')) {
      throw new ApiError('근태확인 이메일 발송 결과를 확인할 수 없습니다.', 200, response);
    }

    return message;
  },

};



