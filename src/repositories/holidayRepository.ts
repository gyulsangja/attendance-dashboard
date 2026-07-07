import { adaptHolidayDtoToHoliday, adaptHolidayToDto } from '@/adapters/holidayAdapter';
import { holidayApi } from '@/api/holidayApi';
import { koreanPublicHolidays } from '@/lib/date';
import type { Holiday } from '@/types/domain';
import { isApiDataSource } from './config';

export type HolidayRepository = {
  selectByYear: (year: number) => Promise<Holiday[]>;
  insert: (holiday: Holiday) => Promise<void>;
  modify: (holiday: Holiday) => Promise<void>;
  delete: (holidayId: string) => Promise<void>;
};

let mockHolidays: Holiday[] = koreanPublicHolidays.map((holiday) => ({
  id: holiday.date,
  date: holiday.date,
  name: holiday.name,
  type: holiday.type,
  isActive: true,
}));

const sortHolidays = (holidays: Holiday[]) => [...holidays].sort((a, b) => a.date.localeCompare(b.date));

const mockHolidayRepository: HolidayRepository = {
  async selectByYear(year) {
    return sortHolidays(mockHolidays.filter((holiday) => holiday.date.startsWith(`${year}-`) && holiday.isActive));
  },

  async insert(holiday) {
    mockHolidays = [
      ...mockHolidays.filter((item) => item.id !== holiday.id && item.date !== holiday.date),
      holiday,
    ];
  },

  async modify(holiday) {
    mockHolidays = mockHolidays.map((item) => (item.id === holiday.id ? holiday : item));
  },

  async delete(holidayId) {
    mockHolidays = mockHolidays.map((item) => (
      item.id === holidayId ? { ...item, isActive: false } : item
    ));
  },
};

const apiHolidayRepository: HolidayRepository = {
  async selectByYear(year) {
    const rows = await holidayApi.select(year);
    return sortHolidays(rows.map(adaptHolidayDtoToHoliday).filter((holiday) => holiday.isActive));
  },

  async insert(holiday) {
    await holidayApi.insert(adaptHolidayToDto(holiday));
  },

  async modify(holiday) {
    await holidayApi.modify(adaptHolidayToDto(holiday));
  },

  async delete(holidayId) {
    await holidayApi.delete(holidayId);
  },
};

export const holidayRepository = isApiDataSource ? apiHolidayRepository : mockHolidayRepository;
