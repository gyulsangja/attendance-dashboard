export type HolidayDto = {
  holiday_id?: string | number;
  holidayId?: string | number;
  id?: string | number;
  holiday_date?: string;
  holidayDate?: string;
  date?: string;
  holiday_name?: string;
  holidayName?: string;
  name?: string;
  holiday_type?: string;
  holidayType?: string;
  type?: string;
  etc?: string;
  use_status?: string;
  useStatus?: string;
  is_active?: boolean | string;
  isActive?: boolean | string;
};

export type HolidayListResponseDto = {
  holidaylist?: HolidayDto[];
  holidayList?: HolidayDto[];
  holidays?: HolidayDto[];
  list?: HolidayDto[];
  data?: HolidayDto[];
};
