'use client';

import { useState } from 'react';
import { Add, Delete } from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import { userRoles, type SystemUser, type UserRole } from '@/mocks';
import { useAccess } from '@/app/_components/auth/AccessProvider';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addSystemUser,
  deleteSystemUser,
  updateSystemUserRole,
} from '@/store/slices/authSlice';

const newUser = (): Omit<SystemUser, 'id'> => ({
  username: '',
  password: '1234',
  name: '',
  role: 'EXECUTIVE',
});

export default function Page() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const { users, currentUserId } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(newUser());
  const [error, setError] = useState('');

  const save = () => {
    if (users.some((user) => user.username === form.username.trim())) {
      setError('이미 사용 중인 아이디입니다.');
      return;
    }
    dispatch(addSystemUser({
      ...form,
      id: Math.max(0, ...users.map((user) => user.id)) + 1,
      username: form.username.trim(),
      name: form.name.trim(),
    }));
    setOpen(false);
  };

  const columns: GridColDef<SystemUser>[] = [
    { field: 'username', headerName: '아이디', minWidth: 140, flex: 1 },
    { field: 'name', headerName: '이름', minWidth: 140, flex: 1 },
    {
      field: 'role',
      headerName: '권한',
      minWidth: 210,
      flex: 1.4,
      renderCell: ({ row }) => (
        <Select
          size="small"
          fullWidth
          value={row.role}
          disabled={row.id === currentUserId}
          onChange={(event) => dispatch(updateSystemUserRole({
            userId: row.id,
            role: event.target.value as UserRole,
          }))}
          sx={{ my: 0.5 }}
        >
          {userRoles.map((role) => (
            <MenuItem key={role.id} value={role.id}>{role.label}</MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: 'description',
      headerName: '사용 범위',
      minWidth: 280,
      flex: 2,
      valueGetter: (_value, row) => userRoles.find((role) => role.id === row.role)?.description ?? '-',
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 90,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Tooltip title={row.id === currentUserId ? '현재 로그인 계정은 삭제할 수 없습니다.' : '회원 삭제'}>
          <span>
            <IconButton
              size="small"
              color="error"
              disabled={row.id === currentUserId}
              onClick={() => {
                if (window.confirm(`${row.name} 회원을 삭제하시겠습니까?`)) {
                  dispatch(deleteSystemUser(row.id));
                }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      ),
    },
  ];

  return (
    <main className="mx-auto max-w-[1400px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">회원 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            시스템 사용자와 메뉴 접근 권한을 관리합니다.
          </p>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setForm(newUser());
            setError('');
            setOpen(true);
          }}
        >
          회원 추가
        </Button>
      </div>

      <Alert severity="info" sx={{ mt: 4 }}>
        관리자 본인의 권한 변경과 계정 삭제는 제한됩니다.
      </Alert>

      <div className="mt-4 h-[590px] rounded-xl bg-white">
        <DataGrid
          rows={users}
          columns={columns}
          rowHeight={64}
          pageSizeOptions={[10, 20]}
          initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
          disableRowSelectionOnClick
          localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            borderColor: '#e2e8f0',
            '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
            '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
          }}
        />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>회원 추가</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2.5}>
            <TextField fullWidth label="이름" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <TextField fullWidth label="아이디" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
            <TextField fullWidth type="password" label="초기 비밀번호" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            <FormControl fullWidth>
              <InputLabel>권한</InputLabel>
              <Select label="권한" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}>
                {userRoles.map((role) => <MenuItem key={role.id} value={role.id}>{role.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button variant="contained" disabled={!form.name.trim() || !form.username.trim() || form.password.length < 4} onClick={save}>저장</Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
