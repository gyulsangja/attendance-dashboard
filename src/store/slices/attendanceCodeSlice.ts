import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AttendanceCode, WorkTimePolicy } from '@/types/domain';

export type AttendanceCodeHistory = {
  id: string;
  codeId: string;
  codeLabel: string;
  effectiveDate: string;
  changeType: string;
  detail: string;
  before?: AttendanceCode;
};

type AttendanceCodeState = {
  codes: AttendanceCode[];
  history: AttendanceCodeHistory[];
  workTimePolicy: WorkTimePolicy;
};

export type { WorkTimePolicy } from '@/types/domain';

const codePolicyDetail = (code: AttendanceCode) =>
  `${code.label} 코드 ${code.isActive ? '사용' : '미사용'}`;

const initialState: AttendanceCodeState = {
  workTimePolicy: {
    regularStart: '09:00',
    regularEnd: '18:00',
    halfAmStart: '14:00',
    halfAmEnd: '18:00',
    halfPmStart: '09:00',
    halfPmEnd: '13:00',
    lateGraceMinutes: 0,
    earlyLeaveGraceMinutes: 0,
  },
  codes: [],
  history: [],
};

const attendanceCodeSlice = createSlice({
  name: 'attendanceCode',
  initialState,
  reducers: {
    updateWorkTimePolicy(state, action: PayloadAction<WorkTimePolicy>) {
      state.workTimePolicy = action.payload;
    },
    addAttendanceCode(state, action: PayloadAction<AttendanceCode>) {
      state.codes.push(action.payload);
      state.history.unshift({
        id: `code-history-${Date.now()}`,
        codeId: action.payload.id,
        codeLabel: action.payload.label,
        effectiveDate: action.payload.startDate,
        changeType: '코드 생성',
        detail: codePolicyDetail(action.payload),
      });
    },
    updateAttendanceCode(
      state,
      action: PayloadAction<{ code: AttendanceCode; effectiveDate: string }>,
    ) {
      const index = state.codes.findIndex((code) => code.id === action.payload.code.id);
      if (index < 0) return;

      const before = { ...state.codes[index] };
      state.codes[index] = action.payload.code;
      state.history.unshift({
        id: `code-history-${Date.now()}`,
        codeId: action.payload.code.id,
        codeLabel: action.payload.code.label,
        effectiveDate: action.payload.effectiveDate,
        changeType: '코드 수정',
        detail: `${before.label} -> ${action.payload.code.label}, ${codePolicyDetail(action.payload.code)}`,
        before,
      });
    },
    endAttendanceCode(
      state,
      action: PayloadAction<{ id: string; effectiveDate: string }>,
    ) {
      const code = state.codes.find((item) => item.id === action.payload.id);
      if (!code) return;

      const before = { ...code };
      code.endDate = action.payload.effectiveDate;
      code.isActive = false;
      state.history.unshift({
        id: `code-history-${Date.now()}`,
        codeId: code.id,
        codeLabel: code.label,
        effectiveDate: action.payload.effectiveDate,
        changeType: '코드 종료',
        detail: `${action.payload.effectiveDate}부터 사용 중지`,
        before,
      });
    },
  },
});

export const {
  updateWorkTimePolicy,
  addAttendanceCode,
  updateAttendanceCode,
  endAttendanceCode,
} = attendanceCodeSlice.actions;

export default attendanceCodeSlice.reducer;

export const getAttendanceCodesAtDate = (
  codes: AttendanceCode[],
  history: AttendanceCodeHistory[],
  date: string,
) => {
  const codeMap = new Map(codes.map((code) => [code.id, { ...code }]));

  [...history]
    .filter((item) => item.effectiveDate > date)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
    .forEach((item) => {
      if (item.changeType === '코드 생성') codeMap.delete(item.codeId);
      else if (item.before) codeMap.set(item.codeId, { ...item.before });
    });

  return [...codeMap.values()].filter(
    (code) => code.startDate <= date && (!code.endDate || code.endDate > date),
  );
};
