import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  attendanceRecords,
  confirmedOperationWeeks,
  operationSchedules,
  shiftSchedules,
  shiftWorkers,
  type AttendanceRecord,
  type OperationSchedule,
  type ShiftSchedule,
} from '@/mocks';
import { getReportEmployeesForDate } from '@/mocks/reports/reportData';
import { evaluateAttendance } from '@/lib/attendance/evaluateAttendance';
import {
  getPreviousWeekPeriod,
  getWeeksInMonth,
  isKoreanPublicHoliday,
} from '@/lib/date';

type ManagementState = {
  year: number;
  month: number;
  weekNumber: number;
  schedules: OperationSchedule[];
  shifts: ShiftSchedule[];
  deviceRecords: AttendanceRecord[];
  publishedRecords: AttendanceRecord[];
  csvUploaded: boolean;
  deviceUpload: DeviceUploadSummary | null;
  confirmed: boolean;
  confirmedWeekKeys: string[];
  confirmedShiftWeekKeys: string[];
};

export type DeviceUploadSummary = {
  fileName: string;
  uploadedAt: string;
  startDate: string;
  endDate: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  absenceRows: number;
  errors: string[];
};

const automaticCodeIds = new Set(['LATE', 'EARLY_LEAVE', 'ABSENT']);
const shiftWorkerIds = new Set(shiftWorkers.map((worker) => worker.employeeId));

const buildInitialDeviceRecords = () => {
  const records = attendanceRecords.map((record) => ({
    ...record,
    events: record.events.map((event) => ({ ...event })),
  }));
  let nextId = Math.max(0, ...records.map((record) => record.id)) + 1;

  confirmedOperationWeeks.forEach((period) => {
    for (
      let current = new Date(`${period.startDate}T00:00:00`);
      current <= new Date(`${period.endDate}T00:00:00`);
      current.setDate(current.getDate() + 1)
    ) {
      const date = [
        current.getFullYear(),
        String(current.getMonth() + 1).padStart(2, '0'),
        String(current.getDate()).padStart(2, '0'),
      ].join('-');
      const weekday = current.getDay() !== 0 && current.getDay() !== 6;
      const publicHoliday = isKoreanPublicHoliday(date);

      getReportEmployeesForDate(date).forEach((employee) => {
        const plannedSchedule = operationSchedules.find(
          (schedule) => schedule.employeeId === employee.id && schedule.date === date,
        );
        const attendanceExempt = Boolean(
          plannedSchedule
          && !['HALF_AM', 'HALF_PM'].includes(plannedSchedule.codeId),
        );
        const shiftSchedule = shiftSchedules.find(
          (schedule) => schedule.employeeId === employee.id && schedule.date === date,
        );
        const attendanceRequired = shiftWorkerIds.has(employee.id)
          ? Boolean(shiftSchedule)
          : weekday && !publicHoliday;
        if (!attendanceRequired || attendanceExempt) return;

        const existing = records.find(
          (record) => record.employeeId === employee.id && record.date === date,
        );
        const standard = shiftWorkerIds.has(employee.id)
          ? shiftSchedule?.checkIn && shiftSchedule.checkOut
            ? { checkIn: shiftSchedule.checkIn, checkOut: shiftSchedule.checkOut }
            : null
          : plannedSchedule?.codeId === 'HALF_AM'
            ? { checkIn: '14:00', checkOut: '18:00' }
            : plannedSchedule?.codeId === 'HALF_PM'
              ? { checkIn: '09:00', checkOut: '13:00' }
              : { checkIn: '09:00', checkOut: '18:00' };
        const automaticEvents = existing?.checkIn
          ? evaluateAttendance(
            { checkIn: existing.checkIn, checkOut: existing.checkOut ?? '' },
            standard,
          )
          : [{ codeId: 'ABSENT', detail: '단말기 출근 기록 없음' }];

        if (existing) {
          existing.events = [
            ...existing.events.filter((event) => !automaticCodeIds.has(event.codeId)),
            ...automaticEvents,
          ];
          return;
        }

        records.push({
          id: nextId,
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department,
          position: employee.position,
          date,
          events: automaticEvents,
        });
        nextId += 1;
      });
    }
  });

  return records;
};

const initialDeviceRecords = buildInitialDeviceRecords();
const initialConfirmedRecords = initialDeviceRecords.filter(
  (record) => confirmedOperationWeeks.some(
    (period) => record.date >= period.startDate && record.date <= period.endDate,
  ),
);
const initialUploadedRecords = attendanceRecords.filter(
  (record) => record.date >= '2026-06-07' && record.date <= '2026-06-13',
);
const defaultOperationWeek = getPreviousWeekPeriod();
const initialConfirmedWeekKeys = confirmedOperationWeeks.map((period) => period.key);
const initialConfirmedShiftWeekKeys = [...new Set([
  '2026-6-2',
  ...initialConfirmedWeekKeys,
])];
const defaultOperationWeekKey = `${defaultOperationWeek.year}-${defaultOperationWeek.month}-${defaultOperationWeek.weekNumber}`;

const initialState: ManagementState = {
  year: defaultOperationWeek.year,
  month: defaultOperationWeek.month,
  weekNumber: defaultOperationWeek.weekNumber,
  schedules: operationSchedules,
  shifts: shiftSchedules,
  deviceRecords: initialDeviceRecords,
  publishedRecords: initialConfirmedRecords
    .map((record) => ({
      ...record,
      events: record.events.map((event) => ({ ...event })),
    })),
  csvUploaded: true,
  deviceUpload: {
    fileName: 'attendance_20260607_20260613.csv',
    uploadedAt: '2026. 6. 14. 오전 9:12',
    startDate: '2026-06-07',
    endDate: '2026-06-13',
    totalRows: initialUploadedRecords.length,
    validRows: initialUploadedRecords.length,
    errorRows: 0,
    absenceRows: initialConfirmedRecords.filter(
      (record) => record.events.some((event) => event.codeId === 'ABSENT'),
    ).length,
    errors: [],
  },
  confirmed: initialConfirmedWeekKeys.includes(defaultOperationWeekKey),
  confirmedWeekKeys: initialConfirmedWeekKeys,
  confirmedShiftWeekKeys: initialConfirmedShiftWeekKeys,
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

const getWeekInfoForDate = (date: string) => {
  const [year, month] = date.split('-').map(Number);
  return getWeeksInMonth(year, month).find(
    (week) => date >= week.startDate && date <= week.endDate,
  );
};

const getWeekKeyForDate = (date: string) => {
  const [year, month] = date.split('-').map(Number);
  const week = getWeekInfoForDate(date);
  return week ? `${year}-${month}-${week.week}` : null;
};

const isShiftWeekConfirmed = (state: ManagementState, date: string) => {
  const key = getWeekKeyForDate(date);
  return Boolean(key && state.confirmedShiftWeekKeys.includes(key));
};

const isOperationWeekConfirmed = (state: ManagementState, date: string) => {
  const [year, month] = date.split('-').map(Number);
  const week = getWeekInfoForDate(date);
  return Boolean(week && state.confirmedWeekKeys.includes(`${year}-${month}-${week.week}`));
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
      if (state.confirmed) return;
      state.schedules.push(...action.payload);
      action.payload.forEach((schedule) => addScheduleEvent(state, schedule));
      markCurrentWeekDirty(state);
    },
    updateSchedule(state, action: PayloadAction<OperationSchedule>) {
      if (state.confirmed) return;
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
      if (state.confirmed) return;
      const schedule = state.schedules.find((item) => item.id === action.payload);
      if (schedule) removeScheduleEvent(state, { ...schedule });
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
          if (state.shifts[index].status !== '확정') {
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
      const key = getWeekKeyForDate(action.payload.startDate);
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
          item.status = action.payload.confirmed ? '확정' : '승인대기';
        }
      });
      markCurrentWeekDirty(state);
    },
    updatePendingShift(state, action: PayloadAction<ShiftSchedule>) {
      if (state.confirmed) return;
      const index = state.shifts.findIndex((item) => item.id === action.payload.id);
      if (index < 0 || state.shifts[index].status !== '승인대기') return;
      state.shifts[index] = { ...action.payload, status: '승인대기' };
      markCurrentWeekDirty(state);
    },
    deletePendingShift(state, action: PayloadAction<number>) {
      if (state.confirmed) return;
      const shift = state.shifts.find((item) => item.id === action.payload);
      if (!shift || shift.status !== '승인대기') return;
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

      state.deviceRecords.forEach((record) => {
        if (record.date >= startDate && record.date <= endDate) {
          record.checkIn = undefined;
          record.checkOut = undefined;
          record.events = record.events.filter(
            (event) => !['LATE', 'EARLY_LEAVE', 'ABSENT'].includes(event.codeId),
          );
        }
      });
      state.deviceRecords = state.deviceRecords.filter(
        (record) => record.date < startDate
          || record.date > endDate
          || record.events.length > 0,
      );

      records.forEach((record) => {
        const existing = state.deviceRecords.find(
          (item) => item.employeeId === record.employeeId && item.date === record.date,
        );
        if (existing) {
          existing.checkIn = record.checkIn;
          existing.checkOut = record.checkOut;
          existing.employeeName = record.employeeName;
          existing.department = record.department;
          existing.position = record.position;
          existing.events.push(...record.events);
        } else {
          state.deviceRecords.push({
            ...record,
            events: record.events.map((event) => ({ ...event })),
          });
        }
      });

      state.csvUploaded = true;
      state.deviceUpload = summary;
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
        events?: AttendanceRecord['events'];
      }>,
    ) {
      if (state.confirmed) return;
      const payload = action.payload;
      const existing = state.deviceRecords.find(
        (item) => item.employeeId === payload.employeeId && item.date === payload.date,
      );
      if (existing) {
        existing.checkIn = payload.checkIn || undefined;
        existing.checkOut = payload.checkOut || undefined;
        existing.events = (payload.events ?? []).map((event) => ({ ...event }));
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
          events: payload.events ?? [],
        });
      }
      markCurrentWeekDirty(state);
    },
    deleteDeviceRecord(
      state,
      action: PayloadAction<{ employeeId: number; date: string }>,
    ) {
      if (state.confirmed) return;
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
        if (!state.confirmedShiftWeekKeys.includes(key)) {
          state.confirmedShiftWeekKeys.push(key);
        }
        state.shifts.forEach((item) => {
          if (item.date >= startDate && item.date <= endDate) {
            item.status = '확정';
          }
        });
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
