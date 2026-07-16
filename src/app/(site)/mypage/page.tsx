'use client';

import { useState } from 'react';
import { Alert, Button, Paper, Stack, TextField } from '@mui/material';
import { useAccess } from '@/app/_components';
import { tokenStorage } from '@/api/tokenStorage';
import { userInfoApi } from '@/api/userInfoApi';
import { useAppDispatch } from '@/store/hooks';
import { changePassword } from '@/store/slices/authSlice';

const getRoleCodeFallback = (roleCode?: string) =>
  roleCode?.startsWith('ROLE_') ? roleCode : 'ROLE_USER';

export default function Page() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const save = async () => {
    if (!access.currentUser) {
      setMessage({ type: 'error', text: '로그인 정보를 확인할 수 없습니다.' });
      return;
    }
    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: '새 비밀번호를 4자 이상 입력해 주세요.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호 확인이 일치하지 않습니다.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const userInfo = await userInfoApi.selectOne(access.currentUser.username).catch(() => null);
      const roleCode = userInfo?.role_code
        ?? userInfo?.roleCode
        ?? userInfo?.auth_cd
        ?? userInfo?.authCd
        ?? access.currentUser.backendRoleCode;

      await userInfoApi.modify({
        ...(userInfo ?? {}),
        user_id: userInfo?.user_id
          ?? userInfo?.userid
          ?? userInfo?.userId
          ?? access.currentUser.username,
        password: newPassword,
        emp_no: userInfo?.emp_no ?? userInfo?.empNo ?? access.currentUser.empNo ?? '',
        user_name: userInfo?.user_name ?? userInfo?.userName ?? access.currentUser.name,
        role_code: getRoleCodeFallback(roleCode),
        acct_stat_code: userInfo?.acct_stat_code ?? userInfo?.acc_stat_code ?? 'ACC01',
        etc: userInfo?.etc ?? '',
      });

      dispatch(changePassword({ userId: access.currentUser.id, password: newPassword }));

      const accessToken = tokenStorage.getAccessToken();
      if (accessToken) {
        tokenStorage.setSession({ ...access.currentUser, password: newPassword }, accessToken);
      }

      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">마이페이지</h1>
      <p className="mt-1 text-sm text-slate-500">내 계정 정보와 비밀번호를 관리합니다.</p>

      <Paper elevation={0} className="mt-5 border border-slate-200 p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">이름</p>
            <p className="mt-1 font-bold">{access.currentUser?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">아이디</p>
            <p className="mt-1 font-bold">{access.currentUser?.username || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">사번</p>
            <p className="mt-1 font-bold">{access.currentUser?.empNo || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">권한</p>
            <p className="mt-1 font-bold">{access.roleLabel}</p>
          </div>
        </div>
      </Paper>

      <Paper elevation={0} className="mt-5 border border-slate-200 p-6">
        <h2 className="font-bold">비밀번호 변경</h2>
        {message && <Alert severity={message.type} sx={{ mt: 3 }}>{message.text}</Alert>}
        <Stack spacing={2.5} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            type="password"
            label="새 비밀번호"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            disabled={saving}
          />
          <TextField
            fullWidth
            type="password"
            label="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={saving}
          />
        </Stack>
        <Button variant="contained" onClick={save} disabled={saving} sx={{ mt: 3 }}>
          {saving ? '변경 중...' : '비밀번호 변경'}
        </Button>
      </Paper>
    </main>
  );
}
