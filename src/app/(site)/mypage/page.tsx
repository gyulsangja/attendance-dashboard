'use client';

import { useState } from 'react';
import { Alert, Button, Paper, Stack, TextField } from '@mui/material';
import { useAccess } from '@/app/_components';
import { useAppDispatch } from '@/store/hooks';
import { changePassword } from '@/store/slices/authSlice';

export default function Page() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const save = () => {
    if (!access.currentUser || currentPassword !== access.currentUser.password) {
      setMessage({ type: 'error', text: '현재 비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: '새 비밀번호는 4자 이상 입력해주세요.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호 확인이 일치하지 않습니다.' });
      return;
    }
    dispatch(changePassword({ userId: access.currentUser.id, password: newPassword }));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
  };

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">마이페이지</h1>
      <p className="mt-1 text-sm text-slate-500">내 계정 정보와 비밀번호를 관리합니다.</p>

      <Paper elevation={0} className="mt-5 border border-slate-200 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><p className="text-xs text-slate-500">이름</p><p className="mt-1 font-bold">{access.currentUser?.name}</p></div>
          <div><p className="text-xs text-slate-500">아이디</p><p className="mt-1 font-bold">{access.currentUser?.username}</p></div>
          <div><p className="text-xs text-slate-500">권한</p><p className="mt-1 font-bold">{access.roleLabel}</p></div>
        </div>
      </Paper>

      <Paper elevation={0} className="mt-5 border border-slate-200 p-6">
        <h2 className="font-bold">비밀번호 변경</h2>
        {message && <Alert severity={message.type} sx={{ mt: 3 }}>{message.text}</Alert>}
        <Stack spacing={2.5} sx={{ mt: 3 }}>
          <TextField fullWidth type="password" label="현재 비밀번호" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          <TextField fullWidth type="password" label="새 비밀번호" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          <TextField fullWidth type="password" label="새 비밀번호 확인" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
        </Stack>
        <Button variant="contained" onClick={save} sx={{ mt: 3 }}>비밀번호 변경</Button>
      </Paper>
    </main>
  );
}
