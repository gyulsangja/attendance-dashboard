import { apiClient } from './client';
import type { SystemSettingDto } from './dto/settings.dto';

type AttendanceBaseSettingRequest = {
  attendbaseinfo: SystemSettingDto;
};

export const settingsApi = {
  get() {
    return apiClient<SystemSettingDto>('/api/system/setting/get', {
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
    return apiClient<string>('/api/attend/manager/attendance/setting', {
      method: 'POST',
      body: { attendbaseinfo: payload } satisfies AttendanceBaseSettingRequest,
    });
  },
};
