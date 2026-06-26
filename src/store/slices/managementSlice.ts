import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getReportEmployeesForDate } from '@/mocks/reports/reportData';
import {
  addScheduleEventToRecords,
  deleteDeviceRecordTimes,
  mergeUploadedDeviceRecords,
  removeScheduleEventFromRecords,
  saveDeviceRecordToRecords,
} from '@/lib/management/attendanceRecords';
import { buildInitialManagementState } from '@/lib/management/managementInitialState';
import {
  getCurrentOperationWeek,
  isOperationWeekConfirmed,
  isShiftWeekConfirmed,
  markCurrentWeekDirty,
  syncConfirmedState,
} from '@/lib/management/managementState';
import {
  confirmOperationWeek,
  unconfirmOperationWeek,
} from '@/lib/management/operationConfirmation';
import { getOperationWeekKeyByDate } from '@/lib/management/operationWeek';
import { SHIFT_STATUS } from '@/lib/management/shiftSchedules';
import type {
  AttendanceRecord,
  DeviceUploadSummary,
  OperationSchedule,
  ShiftSchedule,
} from '@/types/domain';
import type { DeviceRecordPayload } from '@/types/management';

const initialState = buildInitialManagementState();

const getEmployeePosition = (schedule: OperationSchedule) =>
  getReportEmployeesForDate(schedule.date).find(
    (employee) => employee.id === schedule.employeeId,
  )?.position ?? '-';

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
      if (state.confirmed) return;

      state.schedules.push(...action.payload);
      action.payload.forEach((schedule) => {
        state.deviceRecords = addScheduleEventToRecords(
          state.deviceRecords,
          schedule,
          getEmployeePosition(schedule),
        );
      });
      markCurrentWeekDirty(state);
    },
    updateSchedule(state, action: PayloadAction<OperationSchedule>) {
      if (state.confirmed) return;

      const index = state.schedules.findIndex((item) => item.id === action.payload.id);
      if (index >= 0) {
        const previous = { ...state.schedules[index] };
        state.deviceRecords = removeScheduleEventFromRecords(state.deviceRecords, previous);
        state.schedules[index] = action.payload;
        state.deviceRecords = addScheduleEventToRecords(
          state.deviceRecords,
          action.payload,
          getEmployeePosition(action.payload),
        );
      }
      markCurrentWeekDirty(state);
    },
    deleteSchedule(state, action: PayloadAction<number>) {
      if (state.confirmed) return;

      const schedule = state.schedules.find((item) => item.id === action.payload);
      if (schedule) {
        state.deviceRecords = removeScheduleEventFromRecords(state.deviceRecords, { ...schedule });
      }
      state.schedules = state.schedules.filter((item) => item.id !== action.payload);
      markCurrentWeekDirty(state);
    },
    addShifts(state, action: PayloadAction<ShiftSchedule[]>) {
      if (state.confirmed) return;

      let changed = false;
      action.payload.forEach((shift) => {
        if (
          isShiftWeekConfirmed(state, shift.date)
          || isOperationWeekConfirmed(state, shift.date)
        ) return;

        const index = state.shifts.findIndex(
          (item) => item.employeeId === shift.employeeId && item.date === shift.date,
        );
        if (index >= 0) {
          if (state.shifts[index].status !== SHIFT_STATUS.CONFIRMED) {
            state.shifts[index] = shift;
            changed = true;
          }
        } else {
          state.shifts.push(shift);
          changed = true;
        }
      });
      if (changed) markCurrentWeekDirty(state);
    },
    setShiftWeekConfirmed(
      state,
      action: PayloadAction<{
        startDate: string;
        endDate: string;
        confirmed: boolean;
      }>,
    ) {
      if (state.confirmed) return;

      const key = getOperationWeekKeyByDate(action.payload.startDate);
      if (!key) return;

      if (action.payload.confirmed) {
        if (!state.confirmedShiftWeekKeys.includes(key)) {
          state.confirmedShiftWeekKeys.push(key);
        }
      } else {
        state.confirmedShiftWeekKeys = state.confirmedShiftWeekKeys.filter(
          (item) => item !== key,
        );
      }

      state.shifts.forEach((item) => {
        if (
          item.date >= action.payload.startDate
          && item.date <= action.payload.endDate
        ) {
          item.status = action.payload.confirmed
            ? SHIFT_STATUS.CONFIRMED
            : SHIFT_STATUS.PENDING;
        }
      });
      markCurrentWeekDirty(state);
    },
    updatePendingShift(state, action: PayloadAction<ShiftSchedule>) {
      if (state.confirmed) return;

      const index = state.shifts.findIndex((item) => item.id === action.payload.id);
      if (index < 0 || state.shifts[index].status !== SHIFT_STATUS.PENDING) return;

      state.shifts[index] = { ...action.payload, status: SHIFT_STATUS.PENDING };
      markCurrentWeekDirty(state);
    },
    deletePendingShift(state, action: PayloadAction<number>) {
      if (state.confirmed) return;

      const shift = state.shifts.find((item) => item.id === action.payload);
      if (!shift || shift.status !== SHIFT_STATUS.PENDING) return;

      state.shifts = state.shifts.filter((item) => item.id !== action.payload);
      markCurrentWeekDirty(state);
    },
    setCsvUploaded(state, action: PayloadAction<boolean>) {
      state.csvUploaded = action.payload;
      markCurrentWeekDirty(state);
    },
    uploadDeviceRecords(
      state,
      action: PayloadAction<{
        records: AttendanceRecord[];
        summary: DeviceUploadSummary;
        startDate: string;
        endDate: string;
      }>,
    ) {
      if (state.confirmed) return;

      const { records, summary, startDate, endDate } = action.payload;
      state.deviceRecords = mergeUploadedDeviceRecords(
        state.deviceRecords,
        records,
        { startDate, endDate },
      );
      state.csvUploaded = true;
      state.deviceUpload = summary;
      markCurrentWeekDirty(state);
    },
    saveDeviceRecord(state, action: PayloadAction<DeviceRecordPayload>) {
      if (state.confirmed) return;

      const payload = action.payload;
      const employee = getReportEmployeesForDate(payload.date).find(
        (item) => item.id === payload.employeeId,
      );
      state.deviceRecords = saveDeviceRecordToRecords(
        state.deviceRecords,
        payload,
        employee,
      );
      markCurrentWeekDirty(state);
    },
    deleteDeviceRecord(
      state,
      action: PayloadAction<{ employeeId: number; date: string }>,
    ) {
      if (state.confirmed) return;

      state.deviceRecords = deleteDeviceRecordTimes(
        state.deviceRecords,
        action.payload.employeeId,
        action.payload.date,
      );
      markCurrentWeekDirty(state);
    },
    toggleManagementConfirmed(state) {
      const period = getCurrentOperationWeek(state);
      const nextState = state.confirmed
        ? unconfirmOperationWeek({
          period,
          deviceRecords: state.deviceRecords,
          publishedRecords: state.publishedRecords,
          shifts: state.shifts,
          confirmedWeekKeys: state.confirmedWeekKeys,
          confirmedShiftWeekKeys: state.confirmedShiftWeekKeys,
        })
        : confirmOperationWeek({
          period,
          deviceRecords: state.deviceRecords,
          publishedRecords: state.publishedRecords,
          shifts: state.shifts,
          confirmedWeekKeys: state.confirmedWeekKeys,
          confirmedShiftWeekKeys: state.confirmedShiftWeekKeys,
        });

      state.publishedRecords = nextState.publishedRecords;
      state.shifts = nextState.shifts;
      state.confirmedWeekKeys = nextState.confirmedWeekKeys;
      state.confirmedShiftWeekKeys = nextState.confirmedShiftWeekKeys;
      state.confirmed = nextState.confirmed;
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
  updatePendingShift,
  deletePendingShift,
  setShiftWeekConfirmed,
  setCsvUploaded,
  uploadDeviceRecords,
  saveDeviceRecord,
  deleteDeviceRecord,
  toggleManagementConfirmed,
} = managementSlice.actions;

export default managementSlice.reducer;
