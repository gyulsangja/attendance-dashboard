'use client';

import { useMemo, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Alert, Button, Paper, Tab, Tabs } from '@mui/material';
import { useAccess } from '@/app/_components/auth/AccessProvider';
import AttendanceCodeDialog from '@/app/_components/settings/AttendanceCodeDialog';
import AttendanceCodeSettingsGrid from '@/app/_components/settings/AttendanceCodeSettingsGrid';
import EmployeeInfoOptionPanel from '@/app/_components/settings/EmployeeInfoOptionPanel';
import WorkTimePolicyPanel from '@/app/_components/settings/WorkTimePolicyPanel';
import {
  useAttendanceCodesQuery,
  useEndAttendanceCodeMutation,
  useInsertAttendanceCodeMutation,
  useModifyAttendanceCodeMutation,
} from '@/hooks/useAttendanceCodeQueries';
import {
  useUpdateWorkTimePolicyMutation,
  useWorkTimePolicyQuery,
} from '@/hooks/useSettingsQueries';
import { isApiDataSource } from '@/repositories/config';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addAttendanceCode,
  endAttendanceCode,
  getAttendanceCodesAtDate,
  updateAttendanceCode,
  updateWorkTimePolicy,
} from '@/store/slices/attendanceCodeSlice';
import type { AttendanceCode } from '@/types/domain';


const createNextAttendanceCodeId = (codes: AttendanceCode[]) => {
  const prefix = 'ATT_CUSTOM_';
  const maxNumber = codes.reduce((max, code) => {
    if (!code.id.startsWith(prefix)) return max;
    const numeric = Number(code.id.slice(prefix.length));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);

  return `${prefix}${String(maxNumber + 1).padStart(2, '0')}`;
};
const TEXT = {
  noAccess: '권한으로는 설정을 관리할 수 없습니다.',
  endDatePrompt: '사용 종료일을 입력하세요.',
  title: '설정',
  description: '직원 정보 항목, 근태코드, 출퇴근 기준시간을 업무별로 관리합니다.',
  apiInfo: 'API 모드에서는 설정한 항목들을 백엔드 API에 저장합니다. 저장 후 목록에 반영되지 않으면 백엔드 저장 필드 확인이 필요합니다.',
  codeLoadError: '근태코드 API를 불러오지 못했습니다.',
  codeMutationError: '근태코드 저장 중 오류가 발생했습니다. 백엔드 공통코드 저장 DTO 확인이 필요합니다.',
  policyLoadError: '시스템 설정 API를 불러오지 못했습니다.',
  policyMutationError: '기준시간 저장 중 오류가 발생했습니다. 백엔드 시스템 설정 API 구현 여부 확인이 필요합니다.',
  employeeOptionsTab: '직원 정보 항목',
  attendanceCodeTab: '근태코드',
  workTimeTab: '근무시간',
  attendanceTitle: '근태코드 관리',
  attendanceDescription: '지각, 조퇴, 결근, 연차 등 운영관리와 대시보드에서 사용할 근태코드를 관리합니다.',
  addAttendanceCode: '근태코드 추가',
};

export default function Page() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const { codes, history, workTimePolicy } = useAppSelector((state) => state.attendanceCode);
  const attendanceCodesQuery = useAttendanceCodesQuery();
  const insertCodeMutation = useInsertAttendanceCodeMutation();
  const modifyCodeMutation = useModifyAttendanceCodeMutation();
  const endCodeMutation = useEndAttendanceCodeMutation();
  const workTimePolicyQuery = useWorkTimePolicyQuery();
  const updatePolicyMutation = useUpdateWorkTimePolicyMutation();
  const apiCodes = attendanceCodesQuery.data ?? [];
  const sourceCodes = isApiDataSource ? apiCodes : codes;
  const sourceHistory = useMemo(
    () => (isApiDataSource ? [] : history),
    [history],
  );
  const [policy, setPolicy] = useState(workTimePolicy);
  const [policyTouched, setPolicyTouched] = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);
  const [codeTab, setCodeTab] = useState(0);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingCode, setEditingCode] = useState<AttendanceCode | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const visibleCodes = useMemo(
    () => getAttendanceCodesAtDate(sourceCodes, sourceHistory, asOfDate),
    [sourceCodes, sourceHistory, asOfDate],
  );

  const effectivePolicy =
    isApiDataSource && workTimePolicyQuery.data && !policyTouched
      ? workTimePolicyQuery.data
      : policy;

  if (!access.canManageSettings) {
    return <Alert severity="warning">{access.roleLabel} {TEXT.noAccess}</Alert>;
  }

  const openCodeDialog = (code: AttendanceCode | null) => {
    setEditingCode(code);
    setDialogOpen(true);
  };

  const endCode = (code: AttendanceCode) => {
    const date = window.prompt(TEXT.endDatePrompt, asOfDate);
    if (!date) return;

    if (isApiDataSource) {
      endCodeMutation.mutate({ code, effectiveDate: date });
      return;
    }

    dispatch(endAttendanceCode({ id: code.id, effectiveDate: date }));
  };

  const saveCode = (code: AttendanceCode, effectiveDate: string) => {
    const nextCode = {
      ...code,
      id: editingCode ? code.id : code.id || createNextAttendanceCodeId(sourceCodes),
      label: code.label.trim(),
      startDate: effectiveDate,
    };

    if (isApiDataSource) {
      const mutation = editingCode ? modifyCodeMutation : insertCodeMutation;
      mutation.mutate(nextCode, { onSuccess: () => setDialogOpen(false) });
      return;
    }

    dispatch(editingCode
      ? updateAttendanceCode({ code: nextCode, effectiveDate })
      : addAttendanceCode(nextCode));
    setDialogOpen(false);
  };

  const hasMutationError =
    insertCodeMutation.isError || modifyCodeMutation.isError || endCodeMutation.isError;

  const savePolicy = () => {
    if (isApiDataSource) {
      updatePolicyMutation.mutate(effectivePolicy, {
        onSuccess: () => dispatch(updateWorkTimePolicy(effectivePolicy)),
      });
      return;
    }

    dispatch(updateWorkTimePolicy(effectivePolicy));
  };

  return (
    <main className="mx-auto max-w-[1500px]">
      <div>
        <h1 className="text-2xl font-bold">{TEXT.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{TEXT.description}</p>
      </div>

      {isApiDataSource && <Alert severity="info" sx={{ mt: 3 }}>{TEXT.apiInfo}</Alert>}

      {attendanceCodesQuery.isError && (
        <Alert severity="warning" sx={{ mt: 2 }}>{TEXT.codeLoadError}</Alert>
      )}

      {hasMutationError && (
        <Alert severity="error" sx={{ mt: 2 }}>{TEXT.codeMutationError}</Alert>
      )}

      {isApiDataSource && workTimePolicyQuery.isError && (
        <Alert severity="warning" sx={{ mt: 2 }}>{TEXT.policyLoadError}</Alert>
      )}

      {updatePolicyMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>{TEXT.policyMutationError}</Alert>
      )}

      <Paper elevation={0} className="mt-5 border border-slate-200 px-5">
        <Tabs value={settingsTab} onChange={(_event, value) => setSettingsTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab label={TEXT.employeeOptionsTab} />
          <Tab label={TEXT.attendanceCodeTab} />
          <Tab label={TEXT.workTimeTab} />
        </Tabs>
      </Paper>

      {settingsTab === 0 && <EmployeeInfoOptionPanel />}

      {settingsTab === 1 && (
        <section className="mt-5 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-lg font-bold">{TEXT.attendanceTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{TEXT.attendanceDescription}</p>
            </div>
            <Button variant="contained" startIcon={<Add />} onClick={() => openCodeDialog(null)}>
              {TEXT.addAttendanceCode}
            </Button>
          </div>

          <AttendanceCodeSettingsGrid
            tab={codeTab}
            asOfDate={asOfDate}
            visibleCodes={visibleCodes}
            history={sourceHistory}
            onTabChange={setCodeTab}
            onDateChange={setAsOfDate}
            onEdit={openCodeDialog}
            onEnd={endCode}
            actionsDisabled={false}
          />
        </section>
      )}

      {settingsTab === 2 && (
        <WorkTimePolicyPanel
          policy={effectivePolicy}
          saving={updatePolicyMutation.isPending}
          readOnly={false}
          onPolicyChange={(nextPolicy) => {
            setPolicyTouched(true);
            setPolicy(nextPolicy);
          }}
          onSave={savePolicy}
        />
      )}

      <AttendanceCodeDialog
        key={dialogOpen ? editingCode?.id ?? 'new-code' : 'closed-code'}
        open={dialogOpen}
        code={editingCode}
        onClose={() => setDialogOpen(false)}
        onSave={saveCode}
      />
    </main>
  );
}


