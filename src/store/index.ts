import { configureStore } from "@reduxjs/toolkit";
import siteHeaderReducer from "@/features/ui/siteHeaderSlice";

export const store = configureStore({
  reducer: {
    siteHeader: siteHeaderReducer,
  },
});

// 타입 자동 생성
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;