'use client';

import { useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Alert, Button, CircularProgress } from '@mui/material';
import UserDialog from '@/app/_components/admin/UserDialog';
import UserGrid from '@/app/_components/admin/UserGrid';
import { useCommonCodesQuery } from '@/hooks/useCommonCodeQueries';
import {
  useDeleteUserMutation,
  useInsertUserMutation,
  useModifyUserMutation,
  useUsersQuery,
} from '@/hooks/useUserQueries';
import { isApiDataSource } from '@/repositories/config';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addSystemUser,
  deleteSystemUser,
  updateSystemUserRole,
} from '@/store/slices/authSlice';
import type { SystemUser, UserRole } from '@/types/domain';

const newUser = (): Omit<SystemUser, 'id'> => ({
  username: '',
  password: '1234',
  name: '',
  role: 'GENERAL',
});

export default function Page() {
  const dispatch = useAppDispatch();
  const { users: storeUsers, currentUserId } = useAppSelector((state) => state.auth);
  const usersQuery = useUsersQuery();
  const commonCodesQuery = useCommonCodesQuery();
  const insertUserMutation = useInsertUserMutation();
  const modifyUserMutation = useModifyUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const users = isApiDataSource ? usersQuery.data ?? [] : storeUsers;
  const backendRoleCodes = useMemo(
    () => (commonCodesQuery.data ?? []).filter((code) => code.groupCode === 'G_USER_LEVEL'),
    [commonCodesQuery.data],
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(newUser());
  const [error, setError] = useState('');

  const save = () => {
    if (users.some((user) => user.username === form.username.trim())) {
      setError('이미 사용 중인 아이디입니다.');
      return;
    }

    const user = {
      ...form,
      id: Math.max(0, ...users.map((item) => item.id)) + 1,
      username: form.username.trim(),
      name: form.name.trim(),
    };

    if (!isApiDataSource) {
      dispatch(addSystemUser(user));
      setOpen(false);
      return;
    }

    insertUserMutation.mutate(user, {
      onSuccess: () => setOpen(false),
      onError: (error) =>
        setError(error instanceof Error ? error.message : '사용자 등록에 실패했습니다.'),
    });
  };

  const openDialog = () => {
    setForm(newUser());
    setError('');
    setOpen(true);
  };

  const changeRole = (userId: number, role: UserRole) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    if (!isApiDataSource) {
      dispatch(updateSystemUserRole({ userId, role }));
      return;
    }

    modifyUserMutation.mutate({ ...user, role });
  };

  const deleteUser = (user: SystemUser) => {
    if (!window.confirm(`${user.name} 사용자를 삭제하시겠습니까?`)) return;

    if (!isApiDataSource) {
      dispatch(deleteSystemUser(user.id));
      return;
    }

    deleteUserMutation.mutate(user);
  };

  return (
    <main className="mx-auto max-w-[1400px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">사용자 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            시스템 사용자의 메뉴 접근 권한을 관리합니다.
          </p>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={openDialog}>
          사용자 추가
        </Button>
      </div>

      <Alert severity="info" sx={{ mt: 4 }}>
        백엔드 권한 코드는 실제 API의 role_code이며, 프론트 권한은 화면 정책에 맞춰 변환한 값입니다. 사용자 등록/권한 변경/삭제는 백엔드 API 기준으로 처리합니다.
      </Alert>

      {usersQuery.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          사용자 목록을 불러오지 못했습니다.
        </Alert>
      )}

      {commonCodesQuery.isError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          권한 공통코드를 불러오지 못해 백엔드 권한 코드를 그대로 표시합니다.
        </Alert>
      )}

      {(modifyUserMutation.isError || deleteUserMutation.isError) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          사용자 정보 변경 중 오류가 발생했습니다. 백엔드 사용자 저장 DTO 확인이 필요합니다.
        </Alert>
      )}

      {isApiDataSource && usersQuery.isLoading ? (
        <div className="flex min-h-[360px] items-center justify-center">
          <CircularProgress size={32} />
        </div>
      ) : (
        <UserGrid
          users={users}
          currentUserId={currentUserId}
          backendRoleCodes={backendRoleCodes}
          roleChangeDisabled={false}
          onRoleChange={changeRole}
          onDelete={deleteUser}
        />
      )}

      <UserDialog
        open={open}
        form={form}
        error={error}
        saving={insertUserMutation.isPending}
        onFormChange={setForm}
        onClose={() => setOpen(false)}
        onSave={save}
      />
    </main>
  );
}

