import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getReportPeriod } from '@/lib/date';

export type MonthValue = 'all' | number;
export type WeekValue = 'all' | number;

type ReportPeriodState = {
  year: number;
  month: MonthValue;
  week: WeekValue;
  startDate: string;
  endDate: string;
  label: string;
};

const period = getReportPeriod(2026, 6, 'all');

const initialState: ReportPeriodState = {
  year: 2026,
  month: 6,
  week: 'all',
  startDate: period.startDate,
  endDate: period.endDate,
  label: period.label,
};

const reportPeriodSlice = createSlice({
  name: 'reportPeriod',
  initialState,
  reducers: {
    setYear(state, action: PayloadAction<number>) {
      const period = getReportPeriod(action.payload, state.month, 'all');

      state.year = action.payload;
      state.week = 'all';
      state.startDate = period.startDate;
      state.endDate = period.endDate;
      state.label = period.label;
    },

    setMonth(state, action: PayloadAction<MonthValue>) {
      const period = getReportPeriod(state.year, action.payload, 'all');

      state.month = action.payload;
      state.week = 'all';
      state.startDate = period.startDate;
      state.endDate = period.endDate;
      state.label = period.label;
    },

    setWeek(state, action: PayloadAction<WeekValue>) {
      const period = getReportPeriod(state.year, state.month, action.payload);

      state.week = action.payload;
      state.startDate = period.startDate;
      state.endDate = period.endDate;
      state.label = period.label;
    },
  },
});

export const { setYear, setMonth, setWeek } = reportPeriodSlice.actions;

export default reportPeriodSlice.reducer;