import type { HolidayDto } from '@/api/dto/holiday.dto';
import type { Holiday, HolidayType } from '@/types/domain';

const toBoolean = (value: unknown, fallback = true) => {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  const normalized = String(value).trim().toUpperCase();
  if (['Y', 'YES', 'TRUE', '1'].includes(normalized)) return true;
  if (['N', 'NO', 'FALSE', '0'].includes(normalized)) return false;
  return fallback;
};

const toHolidayType = (value: unknown): HolidayType => {
  const normalized = String(value ?? '').trim().toUpperCase();
  if (['PUBLIC', 'SUBSTITUTE', 'TEMPORARY', 'ELECTION', 'COMPANY'].includes(normalized)) {
    return normalized as HolidayType;
  }

  return 'PUBLIC';
};

export const adaptHolidayDtoToHoliday = (dto: HolidayDto): Holiday => {
  const date = dto.holiday_date ?? dto.holidayDate ?? dto.date ?? '';

  return {
    id: String(dto.holiday_id ?? dto.holidayId ?? dto.id ?? date),
    date,
    name: dto.holiday_name ?? dto.holidayName ?? dto.name ?? '',
    type: toHolidayType(dto.holiday_type ?? dto.holidayType ?? dto.type),
    isActive: toBoolean(dto.use_status ?? dto.useStatus ?? dto.is_active ?? dto.isActive),
    etc: dto.etc ?? '',
  };
};

export const adaptHolidayToDto = (holiday: Holiday): HolidayDto => ({
  holiday_id: holiday.id,
  holiday_date: holiday.date,
  holiday_name: holiday.name,
  etc: holiday.etc ?? '',
});
