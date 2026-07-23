'use client';

import { useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Alert, Button, Paper, Tab, Tabs } from '@mui/material';
import { useAccess } from '@/app/_components';
import {
  AttendanceCodeDialog,
  AttendanceCodeSettingsGrid,
  EmployeeInfoOptionPanel,
  HolidaySettingsPanel,
  WorkTimePolicyPanel,
} from '@/app/_components';
import {
  useAttendanceCodesQuery,
  useInsertAttendanceCodeMutation,
  useModifyAttendanceCodeMutation,
} from '@/hooks/useAttendanceCodeQueries';
import {
  useUpdateWorkTimePolicyMutation,
  useWorkTimePolicyQuery,
} from '@/hooks/useSettingsQueries';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateWorkTimePolicy } from '@/store/slices/attendanceCodeSlice';
import type { AttendanceCode } from '@/types/domain';


const createNextAttendanceCodeId = (codes: AttendanceCode[]) => {
  const prefix = 'ATT';
  const maxNumber = codes.reduce((max, code) => {
    if (!code.id.startsWith(prefix)) return max;
    const numeric = Number(code.id.slice(prefix.length).replace(/\D/g, ''));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(2, '0')}`;
};
const TEXT = {
  noAccess: '권한으로는 설정을 관리할 수 없습니다.',
  title: '설정',
  description: '직원 관리, 근태 관리, 근무시간, 공휴일에 필요한 기준값을 관리합니다.',
  codeLoadError: '근태코드 목록을 불러오지 못했습니다.',
  codeMutationError: '근태코드 저장 중 오류가 발생했습니다.',
  policyLoadError: '근무시간 설정을 불러오지 못했습니다.',
  policyMutationError: '근무시간 저장 중 오류가 발생했습니다.',
  policyMutationSuccess: '근무시간 설정이 저장되었습니다.',
  employeeOptionsTab: '직원 항목',
  attendanceCodeTab: '근태코드',
  workTimeTab: '근무시간',
  holidayTab: '공휴일',
  attendanceTitle: '근태코드 관리',
  attendanceDescription: '지각, 조퇴, 결근, 연차 등 운영관리와 상세보기에서 사용할 근태코드를 관리합니다.',
  addAttendanceCode: '근태코드 추가',
  statusTitle: '출입통제 근태상태',
  statusDescription: '출입통제데이터 업로드 후 자동판정 결과로 사용하는 상태 코드입니다.',
  scheduleTitle: '직원별 근태정보',
  scheduleDescription: '운영관리에서 직접 입력하는 연차, 병가, 반차 등 직원별 근태 코드입니다.',
  addStatusCode: '근태상태 추가',
  addScheduleCode: '근태정보 추가',
};

const settingsTabs = [
  { label: TEXT.employeeOptionsTab },
  { label: TEXT.attendanceCodeTab },
  { label: TEXT.workTimeTab },
  { label: TEXT.holidayTab },
];

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';

export default function Page() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const { workTimePolicy } = useAppSelector((state) => state.attendanceCode);
  const attendanceCodesQuery = useAttendanceCodesQuery();
  const insertCodeMutation = useInsertAttendanceCodeMutation();
  const modifyCodeMutation = useModifyAttendanceCodeMutation();
  const workTimePolicyQuery = useWorkTimePolicyQuery();
  const updatePolicyMutation = useUpdateWorkTimePolicyMutation();
  const apiCodes = attendanceCodesQuery.data ?? [];
  const sourceCodes = apiCodes;
  const [policy, setPolicy] = useState(workTimePolicy);
  const [policyTouched, setPolicyTouched] = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);
  const [attendanceCodeTab, setAttendanceCodeTab] = useState(0);
  const [editingCode, setEditingCode] = useState<AttendanceCode | null>(null);
  const [codeDialogGroup, setCodeDialogGroup] = useState<'G_ATTE_CODE' | 'G_ATTE_STATUS'>('G_ATTE_CODE');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [policySaveMessage, setPolicySaveMessage] = useState('');

  const statusCodes = useMemo(
    () => sourceCodes.filter((code) => code.groupCode === 'G_ATTE_STATUS'),
    [sourceCodes],
  );
  const scheduleCodes = useMemo(
    () => sourceCodes.filter((code) => code.groupCode !== 'G_ATTE_STATUS'),
    [sourceCodes],
  );

  const effectivePolicy =
    workTimePolicyQuery.data && !policyTouched
      ? workTimePolicyQuery.data
      : policy;
  const activeCodeSection = attendanceCodeTab === 0
    ? {
      title: TEXT.statusTitle,
      description: TEXT.statusDescription,
      buttonLabel: TEXT.addStatusCode,
      buttonVariant: 'contained' as const,
      groupCode: 'G_ATTE_STATUS' as const,
      codes: statusCodes,
    }
    : {
      title: TEXT.scheduleTitle,
      description: TEXT.scheduleDescription,
      buttonLabel: TEXT.addScheduleCode,
      buttonVariant: 'contained' as const,
      groupCode: 'G_ATTE_CODE' as const,
      codes: scheduleCodes,
    };

  if (!access.canManageSettings) {
    return <Alert severity="warning">{access.roleLabel} {TEXT.noAccess}</Alert>;
  }

  const openCodeDialog = (
    code: AttendanceCode | null,
    groupCode: 'G_ATTE_CODE' | 'G_ATTE_STATUS' = 'G_ATTE_CODE',
  ) => {
    setEditingCode(code);
    setCodeDialogGroup((code?.groupCode as 'G_ATTE_CODE' | 'G_ATTE_STATUS' | undefined) ?? groupCode);
    setDialogOpen(true);
  };

  const saveCode = (code: AttendanceCode, effectiveDate: string) => {
    const nextCode = {
      ...code,
      id: editingCode ? code.id : code.id || createNextAttendanceCodeId(
        sourceCodes.filter((item) => item.groupCode === codeDialogGroup),
      ),
      label: code.label.trim(),
      groupCode: editingCode?.groupCode ?? code.groupCode ?? codeDialogGroup,
      startDate: code.startDate || effectiveDate,
    };

    const mutation = editingCode ? modifyCodeMutation : insertCodeMutation;
    mutation.mutate(nextCode, { onSuccess: () => setDialogOpen(false) });
  };

  const hasMutationError =
    insertCodeMutation.isError || modifyCodeMutation.isError;
  const codeMutationErrorMessage =
    getErrorMessage(insertCodeMutation.error)
    || getErrorMessage(modifyCodeMutation.error)
    || TEXT.codeMutationError;

  const savePolicy = () => {
    setPolicySaveMessage('');
    updatePolicyMutation.mutate(effectivePolicy, {
      onSuccess: () => {
        dispatch(updateWorkTimePolicy(effectivePolicy));
        setPolicySaveMessage(TEXT.policyMutationSuccess);
      },
    });
  };

  return (
    <main className="mx-auto max-w-[1500px]">
      <div>
        <h1 className="text-2xl font-bold">{TEXT.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{TEXT.description}</p>
      </div>

      {attendanceCodesQuery.isError && (
        <Alert severity="warning" sx={{ mt: 2 }}>{TEXT.codeLoadError}</Alert>
      )}

      {hasMutationError && (
        <Alert severity="error" sx={{ mt: 2 }}>{codeMutationErrorMessage}</Alert>
      )}

      {workTimePolicyQuery.isError && (
        <Alert severity="warning" sx={{ mt: 2 }}>{TEXT.policyLoadError}</Alert>
      )}

      <Paper elevation={0} className="mt-5 border border-slate-200 px-5">
        <Tabs value={settingsTab} onChange={(_event, value) => setSettingsTab(value)} variant="scrollable" scrollButtons="auto">
          {settingsTabs.map((tab) => <Tab key={tab.label} label={tab.label} />)}
        </Tabs>
      </Paper>

      {settingsTab === 0 && <EmployeeInfoOptionPanel />}

      {settingsTab === 1 && (
        <section className="mt-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
              <h2 className="text-lg font-bold">{TEXT.attendanceTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{TEXT.attendanceDescription}</p>
              </div>
              <Tabs
                value={attendanceCodeTab}
                onChange={(_event, value) => setAttendanceCodeTab(value)}
                sx={{ minHeight: 36 }}
              >
                <Tab label={TEXT.statusTitle} sx={{ minHeight: 36 }} />
                <Tab label={TEXT.scheduleTitle} sx={{ minHeight: 36 }} />
              </Tabs>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h3 className="font-bold">{activeCodeSection.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{activeCodeSection.description}</p>
              </div>
              <Button
                variant={activeCodeSection.buttonVariant}
                startIcon={<Add />}
                onClick={() => openCodeDialog(null, activeCodeSection.groupCode)}
              >
                {activeCodeSection.buttonLabel}
              </Button>
            </div>
            <AttendanceCodeSettingsGrid
              visibleCodes={activeCodeSection.codes}
              onEdit={(code) => openCodeDialog(code, activeCodeSection.groupCode)}
              actionsDisabled={insertCodeMutation.isPending || modifyCodeMutation.isPending}
            />
          </section>
        </section>
      )}

      {settingsTab === 2 && (
        <WorkTimePolicyPanel
          policy={effectivePolicy}
          saving={updatePolicyMutation.isPending}
          saveMessage={policySaveMessage}
          errorMessage={updatePolicyMutation.isError
            ? getErrorMessage(updatePolicyMutation.error) || TEXT.policyMutationError
            : ''}
          readOnly={false}
          onPolicyChange={(nextPolicy) => {
            setPolicyTouched(true);
            setPolicy(nextPolicy);
            setPolicySaveMessage('');
          }}
          onSave={savePolicy}
        />
      )}

      {settingsTab === 3 && <HolidaySettingsPanel />}

      <AttendanceCodeDialog
        key={dialogOpen ? editingCode?.id ?? `new-code-${codeDialogGroup}` : 'closed-code'}
        open={dialogOpen}
        code={editingCode}
        groupCode={codeDialogGroup}
        onClose={() => setDialogOpen(false)}
        onSave={saveCode}
      />
    </main>
  );
}


