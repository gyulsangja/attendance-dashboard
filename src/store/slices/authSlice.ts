import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { systemUsers, type SystemUser, type UserRole } from '@/mocks';

type AuthState = {
  users: SystemUser[];
  currentUserId: number | null;
  accessToken: string | null;
};

const initialState: AuthState = {
  users: systemUsers.map((user) => ({ ...user })),
  currentUserId: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<number>) {
      state.currentUserId = action.payload;
    },
    setApiSession(
      state,
      action: PayloadAction<{ user: SystemUser; accessToken: string }>,
    ) {
      const existing = state.users.find((user) => user.id === action.payload.user.id);
      if (existing) Object.assign(existing, action.payload.user);
      else state.users.push(action.payload.user);
      state.currentUserId = action.payload.user.id;
      state.accessToken = action.payload.accessToken;
    },
    logout(state) {
      state.currentUserId = null;
      state.accessToken = null;
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
  setApiSession,
  logout,
  changePassword,
  addSystemUser,
  updateSystemUserRole,
  deleteSystemUser,
} = authSlice.actions;

export default authSlice.reducer;
