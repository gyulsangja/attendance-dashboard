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

type UserDialogProps = {
  open: boolean;
  form: Omit<SystemUser, 'id'>;
  error: string;
  saving?: boolean;
  onFormChange: (form: Omit<SystemUser, 'id'>) => void;
  onClose: () => void;
  onSave: () => void;
};

export default function UserDialog({
  open,
  form,
  error,
  saving = false,
  onFormChange,
  onClose,
  onSave,
}: UserDialogProps) {
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
              value={form.role}
              onChange={(event) => onFormChange({ ...form, role: event.target.value as UserRole })}
            >
              {userRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>{role.label}</MenuItem>
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
