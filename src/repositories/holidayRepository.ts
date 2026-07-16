import { adaptHolidayDtoToHoliday, adaptHolidayToDto } from '@/adapters/holidayAdapter';
import { holidayApi } from '@/api/holidayApi';
import type { Holiday } from '@/types/domain';

export type HolidayRepository = {
  selectByYear: (year: number) => Promise<Holiday[]>;
  insert: (holiday: Holiday) => Promise<void>;
  modify: (holiday: Holiday) => Promise<void>;
  delete: (holidayId: string) => Promise<void>;
};

const sortHolidays = (holidays: Holiday[]) => [...holidays].sort((a, b) => a.date.localeCompare(b.date));

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

export const holidayRepository = apiHolidayRepository;
