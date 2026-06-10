import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
  },
});

// 타입 자동 생성
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;