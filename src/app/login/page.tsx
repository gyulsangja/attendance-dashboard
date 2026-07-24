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
import { getDefaultPath } from '@/app/_components';
import { tokenStorage } from '@/api/tokenStorage';
import { useLoginMutation } from '@/hooks/useAuthMutations';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, setApiSession } from '@/store/slices/authSlice';

const getInitialAuthMessage = () => (
  typeof window === 'undefined' ? '' : tokenStorage.getAuthMessage() ?? ''
);

export default function Page() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loginMutation = useLoginMutation();
  const { users, currentUserId } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState(() => (
    typeof window === 'undefined'
      ? ''
      : window.localStorage.getItem('attendance-saved-id') ?? ''
  ));
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => (
    typeof window === 'undefined'
      ? false
      : Boolean(window.localStorage.getItem('attendance-saved-id'))
  ));
  const [error, setError] = useState(getInitialAuthMessage);

  useEffect(() => {
    tokenStorage.clearAuthMessage();
  }, []);

  useEffect(() => {
    const currentUser = users.find((user) => user.id === currentUserId);
    if (currentUser) router.replace(getDefaultPath(currentUser.role));
  }, [currentUserId, users, router]);

  const submit = () => {
    if (loginMutation.isPending) return;
    setError('');
    tokenStorage.clearAuthMessage();

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: ({ user, accessToken }) => {
          if (remember) window.localStorage.setItem('attendance-saved-id', user.username);
          else window.localStorage.removeItem('attendance-saved-id');

          if (accessToken) dispatch(setApiSession({ user, accessToken }));
          else dispatch(login(user.id));
          router.replace(getDefaultPath(user.role));
        },
        onError: (loginError) => {
          setError(loginError instanceof Error ? loginError.message : '로그인에 실패했습니다.');
        },
      },
    );
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
          <h1 className="text-center text-4xl font-black">안녕하세요</h1>
          <p className="mt-4 text-center text-slate-500">
            업무관리시스템에 로그인해 주세요.
          </p>

          {error && <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>}

          <Stack spacing={2.5} sx={{ mt: 4 }}>
            <TextField
              fullWidth
              label="아이디"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submit();
              }}
            />
            <TextField
              fullWidth
              label="비밀번호"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submit();
              }}
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
            disabled={loginMutation.isPending}
            onClick={submit}
            sx={{ mt: 3, py: 1.4 }}
          >
            {loginMutation.isPending ? '로그인 중' : '로그인'}
          </Button>
        </div>
      </div>
    </div>
  );
}
