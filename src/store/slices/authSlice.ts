import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { systemUsers, type SystemUser, type UserRole } from '@/mocks';

type AuthState = {
  users: SystemUser[];
  currentUserId: number | null;
};

const initialState: AuthState = {
  users: systemUsers.map((user) => ({ ...user })),
  currentUserId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<number>) {
      state.currentUserId = action.payload;
    },
    logout(state) {
      state.currentUserId = null;
    },
    changePassword(
      state,
      action: PayloadAction<{ userId: number; password: string }>,
    ) {
      const user = state.users.find((item) => item.id === action.payload.userId);
      if (user) user.password = action.payload.password;
    },
    addSystemUser(state, action: PayloadAction<SystemUser>) {
      state.users.push(action.payload);
    },
    updateSystemUserRole(
      state,
      action: PayloadAction<{ userId: number; role: UserRole }>,
    ) {
      const user = state.users.find((item) => item.id === action.payload.userId);
      if (user) user.role = action.payload.role;
    },
    deleteSystemUser(state, action: PayloadAction<number>) {
      if (state.currentUserId === action.payload) return;
      state.users = state.users.filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  login,
  logout,
  changePassword,
  addSystemUser,
  updateSystemUserRole,
  deleteSystemUser,
} = authSlice.actions;

export default authSlice.reducer;
