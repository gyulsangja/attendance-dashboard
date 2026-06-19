import { configureStore } from "@reduxjs/toolkit";

import reportPeriodReducer from './slices/reportPeriodSlice';

export const store = configureStore({
  reducer: {
    reportPeriod: reportPeriodReducer,
  },
});

// 타입 자동 생성
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;