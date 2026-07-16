import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialUserRole } from '@/constants/roles';
import type { UserRole } from '@/types/domain';

type AccessState = { role: UserRole };

const initialState: AccessState = { role: initialUserRole };

const accessSlice = createSlice({
  name: 'access',
  initialState,
  reducers: {
    setUserRole(state, action: PayloadAction<UserRole>) {
      state.role = action.payload;
    },
  },
});

export const { setUserRole } = accessSlice.actions;
export default accessSlice.reducer;
