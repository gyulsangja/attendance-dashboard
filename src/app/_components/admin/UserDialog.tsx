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
import { normalizeUserRole } from '@/adapters/authAdapter';
import {
  getDefaultBackendRoleCode,
  normalizeBackendRoleCode,
  userRoles,
} from '@/constants/roles';
import type { SystemUser } from '@/types/domain';

export type UserRoleOption = {
  value: string;
  label: string;
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

const fallbackRoleOptions: UserRoleOption[] = userRoles.map((role) => ({
  value: getDefaultBackendRoleCode(role.id),
  label: role.label,
}));

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
  const resolvedRoleOptions = roleOptions.length > 0 ? roleOptions : fallbackRoleOptions;
  const selectedRoleCode = normalizeBackendRoleCode(form.backendRoleCode) || getDefaultBackendRoleCode(form.role);
  const isSaveDisabled =
    saving
    || !form.name.trim()
    || !form.username.trim()
    || !form.empNo?.trim()
    || form.password.length < 4;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>사용자 추가</DialogTitle>
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
            label="사번"
            value={form.empNo ?? ''}
            onChange={(event) => onFormChange({ ...form, empNo: event.target.value })}
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
              value={selectedRoleCode}
              onChange={(event) => {
                const value = normalizeBackendRoleCode(event.target.value);
                const option = resolvedRoleOptions.find((item) => item.value === value);
                onFormChange({
                  ...form,
                  role: normalizeUserRole(value),
                  backendRoleCode: value,
                  backendRoleName: option?.label ?? value,
                });
              }}
            >
              {resolvedRoleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={isSaveDisabled}
          onClick={onSave}
        >
          {saving ? '저장 중' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
