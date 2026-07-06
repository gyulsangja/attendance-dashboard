'use client';

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { userRoles, type UserRole } from '@/mocks';
import type { SystemUser } from '@/types/domain';

export type UserRoleOption = {
  value: string;
  label: string;
  role: UserRole;
};

type UserDialogProps = {
  open: boolean;
  form: Omit<SystemUser, 'id'>;
  error: string;
  saving?: boolean;
  roleOptions?: UserRoleOption[];
  onFormChange: (form: Omit<SystemUser, 'id'>) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function UserDialog({
  open,
  form,
  error,
  saving = false,
  roleOptions = [],
  onFormChange,
  onClose,
  onSave,
}: UserDialogProps) {
  const resolvedRoleOptions = roleOptions.length > 0
    ? roleOptions
    : userRoles.map((role) => ({
      value: role.id,
      label: role.label,
      role: role.id,
    }));
  const selectedRoleValue = form.backendRoleCode ?? form.role;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>회원 추가</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="이름"
            value={form.name}
            onChange={(event) => onFormChange({ ...form, name: event.target.value })}
          />
          <TextField
            fullWidth
            label="아이디"
            value={form.username}
            onChange={(event) => onFormChange({ ...form, username: event.target.value })}
          />
          <TextField
            fullWidth
            type="password"
            label="초기 비밀번호"
            value={form.password}
            onChange={(event) => onFormChange({ ...form, password: event.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>권한</InputLabel>
            <Select
              label="권한"
              value={selectedRoleValue}
              onChange={(event) => {
                const value = event.target.value;
                const option = resolvedRoleOptions.find((item) => item.value === value);
                onFormChange({
                  ...form,
                  role: option?.role ?? value as UserRole,
                  backendRoleCode: option?.value,
                  backendRoleName: option?.label,
                });
              }}
            >
              {resolvedRoleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={saving || !form.name.trim() || !form.username.trim() || form.password.length < 4}
          onClick={onSave}
        >
          {saving ? '저장 중' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
