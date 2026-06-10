import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ReportViewType =
  | "filtered"
  | "employees"
  | "records";

interface ReportContentsNavState {
  selectedView: ReportViewType;
}

const initialState: ReportContentsNavState = {
  selectedView: "filtered",
};

const reportContentsNavSlice = createSlice({
  name: "reportContentsNav",
  initialState,
  reducers: {
    setSelectedView(
      state,
      action: PayloadAction<ReportViewType>
    ) {
      state.selectedView = action.payload;
    },
  },
});

export const { setSelectedView } =
  reportContentsNavSlice.actions;

export default reportContentsNavSlice.reducer;