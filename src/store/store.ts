import { configureStore } from "@reduxjs/toolkit";

import reportPeriodReducer from './slices/reportPeriodSlice';
import accessReducer from './slices/accessSlice';
import managementReducer from './slices/managementSlice';
import organizationReducer from './slices/organizationSlice';
import attendanceCodeReducer from './slices/attendanceCodeSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    reportPeriod: reportPeriodReducer,
    access: accessReducer,
    management: managementReducer,
    organization: organizationReducer,
    attendanceCode: attendanceCodeReducer,
    auth: authReducer,
  },
});

// 타입 자동 생성
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
