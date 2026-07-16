import { apiClient } from './client';
import type { SystemSettingDto } from './dto/settings.dto';

type AttendanceBaseSettingRequest = {
  attendbaseinfo: SystemSettingDto;
};

const normalizeAttendanceBaseSettingPayload = (payload: SystemSettingDto): SystemSettingDto => ({
  woking_time: payload.woking_time ?? payload.working_time ?? payload.regular_start ?? payload.regularStart ?? '',
  leave_time: payload.leave_time ?? payload.regular_end ?? payload.regularEnd ?? '',
  moring_off_time: payload.moring_off_time ?? payload.morning_off_time ?? payload.half_am_end ?? payload.halfAmEnd ?? '',
  afternoon_off_time: payload.afternoon_off_time ?? payload.half_pm_start ?? payload.halfPmStart ?? '',
  early_leave_time: payload.early_leave_time ?? '',
});

export const settingsApi = {
  get() {
    return apiClient<SystemSettingDto>('/api/attend/manager/attendance/time/info', {
      method: 'POST',
    });
  },

  modify(payload: SystemSettingDto) {
    return apiClient<string>('/api/system/setting/modify', {
      method: 'POST',
      body: payload,
    });
  },

  saveAttendanceBase(payload: SystemSettingDto) {
    return apiClient<string>('/api/attend/manager/attendance/time/set', {
      method: 'POST',
      body: { attendbaseinfo: normalizeAttendanceBaseSettingPayload(payload) } satisfies AttendanceBaseSettingRequest,
    });
  },
};
