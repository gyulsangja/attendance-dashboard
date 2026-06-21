'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from '@mui/material';
import { getDefaultPath } from '@/app/_components/auth/AuthGuard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { users, currentUserId } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedId = window.localStorage.getItem('attendance-saved-id');
    if (savedId) {
      setUsername(savedId);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    const currentUser = users.find((user) => user.id === currentUserId);
    if (currentUser) router.replace(getDefaultPath(currentUser.role));
  }, [currentUserId, users, router]);

  const submit = () => {
    const user = users.find(
      (item) => item.username === username.trim() && item.password === password,
    );
    if (!user) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      return;
    }

    if (remember) window.localStorage.setItem('attendance-saved-id', user.username);
    else window.localStorage.removeItem('attendance-saved-id');
    dispatch(login(user.id));
    router.replace(getDefaultPath(user.role));
  };

  return (
    <div className="flex min-h-dvh bg-white">
      <div className="hidden w-1/2 lg:block">
        <Image
          src="/images/loginBg.jpg"
          alt="로그인 이미지"
          width={960}
          height={1080}
          className="h-full w-full object-cover"
          priority
        />
      </div>

      <div className="flex w-full flex-col justify-center px-6 lg:w-1/2">
        <div className="mx-auto w-full max-w-[460px]">
          <h1 className="text-center text-4xl font-black">안녕하세요!</h1>
          <p className="mt-4 text-center text-slate-500">
            출퇴근 관리 시스템에 로그인해주세요.
          </p>

          {error && <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}

          <Stack spacing={2.5} sx={{ mt: 4 }}>
            <TextField
              fullWidth
              label="아이디"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submit()}
            />
            <TextField
              fullWidth
              label="비밀번호"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submit()}
            />
          </Stack>

          <FormControlLabel
            sx={{ mt: 1.5, ml: 0 }}
            control={(
              <Checkbox
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
            )}
            label="아이디 저장"
          />

          <Button
            fullWidth
            size="large"
            variant="contained"
            onClick={submit}
            sx={{ mt: 3, py: 1.4 }}
          >
            로그인
          </Button>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-bold">검토용 계정</p>
            <p className="mt-2">관리자: admin / admin123</p>
            <p>경영진: executive / 1234</p>
            <p>교대담당: shift / 1234</p>
            <p>조직담당: organization / 1234</p>
            <p>일반 사용자: user / 1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
