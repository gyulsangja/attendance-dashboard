import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  attendanceRecords,
  confirmedOperationWeeks,
  operationSchedules,
  shiftSchedules,
  type AttendanceRecord,
  type OperationSchedule,
  type ShiftSchedule,
} from '@/mocks';
import { getReportEmployeesForDate } from '@/mocks/reports/reportData';
import { getWeeksInMonth } from '@/lib/date';

type ManagementState = {
  year: number;
  month: number;
  weekNumber: number;
  schedules: OperationSchedule[];
  shifts: ShiftSchedule[];
  deviceRecords: AttendanceRecord[];
  publishedRecords: AttendanceRecord[];
  csvUploaded: boolean;
  confirmed: boolean;
  confirmedWeekKeys: string[];
};

const initialState: ManagementState = {
  year: 2026,
  month: 6,
  weekNumber: 2,
  schedules: operationSchedules,
  shifts: shiftSchedules,
  deviceRecords: attendanceRecords,
  publishedRecords: attendanceRecords
    .filter((record) => confirmedOperationWeeks.some(
      (period) => record.date >= period.startDate && record.date <= period.endDate,
    ))
    .map((record) => ({
      ...record,
      events: record.events.map((event) => ({ ...event })),
    })),
  csvUploaded: true,
  confirmed: true,
  confirmedWeekKeys: confirmedOperationWeeks.map((period) => period.key),
};

const getCurrentWeekInfo = (state: ManagementState) => {
  const weeks = getWeeksInMonth(state.year, state.month);
  const week = weeks.find((item) => item.week === state.weekNumber) ?? weeks[0];
  return {
    key: `${state.year}-${state.month}-${state.weekNumber}`,
    startDate: week?.startDate ?? `${state.year}-${String(state.month).padStart(2, '0')}-01`,
    endDate: week?.endDate ?? `${state.year}-${String(state.month).padStart(2, '0')}-07`,
  };
};

const syncConfirmedState = (state: ManagementState) => {
  const { key } = getCurrentWeekInfo(state);
  state.confirmed = state.confirmedWeekKeys.includes(key);
};

const markCurrentWeekDirty = (state: ManagementState) => {
  const { key, startDate, endDate } = getCurrentWeekInfo(state);
  state.confirmedWeekKeys = state.confirmedWeekKeys.filter((item) => item !== key);
  state.publishedRecords = state.publishedRecords.filter(
    (record) => record.date < startDate || record.date > endDate,
  );
  state.confirmed = false;
};

const addScheduleEvent = (
  state: ManagementState,
  schedule: OperationSchedule,
) => {
  let record = state.deviceRecords.find(
    (item) =>
      item.employeeId === schedule.employeeId
      && item.date === schedule.date,
  );
  if (!record) {
    record = {
      id: Math.max(0, ...state.deviceRecords.map((item) => item.id)) + 1,
      employeeId: schedule.employeeId,
      employeeName: schedule.name,
      department: schedule.department,
      position: getReportEmployeesForDate(schedule.date).find(
        (employee) => employee.id === schedule.employeeId,
      )?.position ?? '-',
      date: schedule.date,
      events: [],
    };
    state.deviceRecords.push(record);
  }
  if (!record.events.some((event) => event.codeId === schedule.codeId)) {
    record.events.push({
      codeId: schedule.codeId,
      detail: schedule.detail,
    });
  }
};

const removeScheduleEvent = (
  state: ManagementState,
  schedule: OperationSchedule,
) => {
  const record = state.deviceRecords.find(
    (item) =>
      item.employeeId === schedule.employeeId
      && item.date === schedule.date,
  );
  if (!record) return;
  record.events = record.events.filter(
    (event) => event.codeId !== schedule.codeId,
  );
  if (!record.checkIn && !record.checkOut && record.events.length === 0) {
    state.deviceRecords = state.deviceRecords.filter(
      (item) => item.id !== record.id,
    );
  }
};

const managementSlice = createSlice({
  name: 'management',
  initialState,
  reducers: {
    setOperationYear(state, action: PayloadAction<number>) {
      state.year = action.payload;
      syncConfirmedState(state);
    },
    setOperationMonth(state, action: PayloadAction<number>) {
      state.month = action.payload;
      state.weekNumber = 1;
      syncConfirmedState(state);
    },
    setOperationWeek(state, action: PayloadAction<number>) {
      state.weekNumber = action.payload;
      syncConfirmedState(state);
    },
    addSchedules(state, action: PayloadAction<OperationSchedule[]>) {
      state.schedules.push(...action.payload);
      action.payload.forEach((schedule) => addScheduleEvent(state, schedule));
      markCurrentWeekDirty(state);
    },
    updateSchedule(state, action: PayloadAction<OperationSchedule>) {
      const index = state.schedules.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        const previous = { ...state.schedules[index] };
        removeScheduleEvent(state, previous);
        state.schedules[index] = action.payload;
        addScheduleEvent(state, action.payload);
      }
      markCurrentWeekDirty(state);
    },
    deleteSchedule(state, action: PayloadAction<number>) {
      const schedule = state.schedules.find((item) => item.id === action.payload);
      if (schedule) removeScheduleEvent(state, { ...schedule });
      state.schedules = state.schedules.filter((item) => item.id !== action.payload);
      markCurrentWeekDirty(state);
    },
    addShifts(state, action: PayloadAction<ShiftSchedule[]>) {
      state.shifts.push(...action.payload);
      markCurrentWeekDirty(state);
    },
    setShiftConfirmed(state, action: PayloadAction<{ id: number; confirmed: boolean }>) {
      const shift = state.shifts.find((item) => item.id === action.payload.id);
      if (shift) shift.status = action.payload.confirmed ? '확정' : '승인대기';
      markCurrentWeekDirty(state);
    },
    confirmAllShifts(state) {
      state.shifts.forEach((item) => { item.status = '확정'; });
      markCurrentWeekDirty(state);
    },
    setCsvUploaded(state, action: PayloadAction<boolean>) {
      state.csvUploaded = action.payload;
      markCurrentWeekDirty(state);
    },
    saveDeviceRecord(
      state,
      action: PayloadAction<{
        employeeId: number;
        date: string;
        checkIn: string;
        checkOut: string;
        employeeName?: string;
        department?: string;
        position?: string;
      }>,
    ) {
      const payload = action.payload;
      const existing = state.deviceRecords.find(
        (item) => item.employeeId === payload.employeeId && item.date === payload.date,
      );
      if (existing) {
        existing.checkIn = payload.checkIn || undefined;
        existing.checkOut = payload.checkOut || undefined;
      } else {
        const employee = getReportEmployeesForDate(payload.date).find(
          (item) => item.id === payload.employeeId,
        );
        state.deviceRecords.push({
          id: Math.max(0, ...state.deviceRecords.map((item) => item.id)) + 1,
          employeeId: payload.employeeId,
          employeeName: payload.employeeName ?? employee?.name ?? '-',
          department: payload.department ?? employee?.department ?? '-',
          position: payload.position ?? employee?.position ?? '-',
          date: payload.date,
          checkIn: payload.checkIn || undefined,
          checkOut: payload.checkOut || undefined,
          events: [],
        });
      }
      markCurrentWeekDirty(state);
    },
    deleteDeviceRecord(
      state,
      action: PayloadAction<{ employeeId: number; date: string }>,
    ) {
      const record = state.deviceRecords.find(
        (item) =>
          item.employeeId === action.payload.employeeId
          && item.date === action.payload.date,
      );
      if (record?.events.length) {
        record.checkIn = undefined;
        record.checkOut = undefined;
      } else {
        state.deviceRecords = state.deviceRecords.filter(
          (item) => !(
            item.employeeId === action.payload.employeeId
            && item.date === action.payload.date
          ),
        );
      }
      markCurrentWeekDirty(state);
    },
    toggleManagementConfirmed(state) {
      const { key, startDate, endDate } = getCurrentWeekInfo(state);
      state.publishedRecords = state.publishedRecords.filter(
        (record) => record.date < startDate || record.date > endDate,
      );

      if (state.confirmed) {
        state.confirmedWeekKeys = state.confirmedWeekKeys.filter(
          (item) => item !== key,
        );
        state.confirmed = false;
      } else {
        const weekRecords = state.deviceRecords
          .filter((record) => record.date >= startDate && record.date <= endDate)
          .map((record) => ({
          ...record,
          events: record.events.map((event) => ({ ...event })),
          }));
        state.publishedRecords.push(...weekRecords);
        if (!state.confirmedWeekKeys.includes(key)) {
          state.confirmedWeekKeys.push(key);
        }
        state.confirmed = true;
      }
    },
  },
});

export const {
  setOperationYear,
  setOperationMonth,
  setOperationWeek,
  addSchedules,
  updateSchedule,
  deleteSchedule,
  addShifts,
  setShiftConfirmed,
  confirmAllShifts,
  setCsvUploaded,
  saveDeviceRecord,
  deleteDeviceRecord,
  toggleManagementConfirmed,
} = managementSlice.actions;

export default managementSlice.reducer;
