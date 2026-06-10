import { createSlice } from "@reduxjs/toolkit";

interface HeaderState {
  headerState: boolean;
}

const initialState: HeaderState = {
  headerState: false,
};

const siteHeaderSlice = createSlice({
  name: "siteHeader",
  initialState,
  reducers: {
    setHeaderState(state) {
      state.headerState = !state.headerState;
    },
  },
});

export const { setHeaderState } = siteHeaderSlice.actions;
export default siteHeaderSlice.reducer;