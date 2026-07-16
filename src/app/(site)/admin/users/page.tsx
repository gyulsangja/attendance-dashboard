'use client';

import { useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Alert, Button, CircularProgress } from '@mui/material';
import { UserDialog, UserGrid, type UserRoleOption } from '@/app/_components';
import { normalizeUserRole } from '@/adapters/authAdapter';
import { getDefaultBackendRoleCode, normalizeBackendRoleCode } from '@/constants/roles';
import { useCommonCodesQuery } from '@/hooks/useCommonCodeQueries';
import {
  useDeleteUserMutation,
  useInsertUserMutation,
  useModifyUserMutation,
  useUsersQuery,
} from '@/hooks/useUserQueries';
import { useAppSelector } from '@/store/hooks';
import type { SystemUser } from '@/types/domain';

const newUser = (): Omit<SystemUser, 'id'> => ({
  username: '',
  password: '',
  name: '',
  empNo: '',
  role: 'GENERAL',
  backendRoleCode: getDefaultBackendRoleCode('GENERAL'),
  backendRoleName: '일반사용자',
});

export default function Page() {
  const { currentUserId } = useAppSelector((state) => state.auth);
  const usersQuery = useUsersQuery();
  const commonCodesQuery = useCommonCodesQuery();
  const insertUserMutation = useInsertUserMutation();
  const modifyUserMutation = useModifyUserMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const users = usersQuery.data ?? [];
  const backendRoleCodes = useMemo(
    () => (commonCodesQuery.data ?? []).filter((code) => code.groupCode === 'G_USER_LEVEL'),
    [commonCodesQuery.data],
  );
  const backendRoleOptions = useMemo<UserRoleOption[]>(
    () => backendRoleCodes
      .filter((code) => code.isActive && code.detailCode)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((code) => ({
        value: normalizeBackendRoleCode(code.detailCode),
        label: code.label,
      })),
    [backendRoleCodes],
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(newUser());
  const [error, setError] = useState('');

  const save = () => {
    const username = form.username.trim();
    const empNo = form.empNo?.trim() ?? '';

    if (!/^[A-Za-z0-9_.-]+$/.test(username)) {
      setError('아이디는 영문, 숫자, 마침표, 하이픈, 밑줄만 사용할 수 있습니다.');
      return;
    }

    if (!/^[0-9]+$/.test(empNo)) {
      setError('사번은 숫자만 입력해 주세요.');
      return;
    }

    if (users.some((user) => user.username === username)) {
      setError('이미 사용 중인 아이디입니다.');
      return;
    }

    const user = {
      ...form,
      id: Math.max(0, ...users.map((item) => item.id)) + 1,
      username,
      name: form.name.trim(),
      empNo,
      role: normalizeUserRole(form.backendRoleCode),
    };

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

  const changeRole = (user: SystemUser, roleCode: string) => {
    const normalizedRoleCode = normalizeBackendRoleCode(roleCode);
    const roleOption = backendRoleOptions.find((item) => item.value === normalizedRoleCode);

    modifyUserMutation.mutate({
      ...user,
      role: normalizeUserRole(normalizedRoleCode),
      backendRoleCode: normalizedRoleCode,
      backendRoleName: roleOption?.label ?? normalizedRoleCode,
    });
  };

  const deleteUser = (user: SystemUser) => {
    if (!window.confirm(`${user.name} 사용자를 삭제하시겠습니까?`)) return;

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

      {usersQuery.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          사용자 목록을 불러오지 못했습니다.
        </Alert>
      )}

      {commonCodesQuery.isError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          권한 공통코드를 불러오지 못해 권한 코드를 그대로 표시합니다.
        </Alert>
      )}

      {(modifyUserMutation.isError || deleteUserMutation.isError) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          사용자 정보 변경 중 오류가 발생했습니다.
        </Alert>
      )}

      {usersQuery.isLoading ? (
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
        roleOptions={backendRoleOptions}
        onFormChange={setForm}
        onClose={() => setOpen(false)}
        onSave={save}
      />
    </main>
  );
}

