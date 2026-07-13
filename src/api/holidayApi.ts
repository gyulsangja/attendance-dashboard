import { apiClient } from './client';
import type { HolidayDto, HolidayListResponseDto } from './dto/holiday.dto';

const unwrapHolidayList = (response: HolidayDto[] | HolidayListResponseDto) => {
  if (Array.isArray(response)) return response;

  return response.holidaylist
    ?? response.holidayList
    ?? response.holidays
    ?? response.list
    ?? response.data
    ?? [];
};

export const holidayApi = {
  async select(year: number) {
    const response = await apiClient<HolidayDto[] | HolidayListResponseDto>(`/api/attend/manager/holiday/select/${year}`);
    return unwrapHolidayList(response);
  },

  insert(payload: HolidayDto) {
    return apiClient<string>('/api/attend/manager/holiday/insert', {
      method: 'POST',
      body: {
        holidayinfo: payload,
      },
    });
  },

  modify(payload: HolidayDto) {
    return apiClient<string>('/api/attend/manager/holiday/modify', {
      method: 'POST',
      body: { holidayinfo: payload },
    });
  },

  delete(holidayId: string) {
    return apiClient<string>(`/api/attend/manager/holiday/delete/${holidayId}`, {
      method: 'POST',
    });
  },
};
