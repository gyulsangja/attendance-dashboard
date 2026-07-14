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
  description: '직원 관리, 근태 관리, 근무시간, 공휴일에 필요한 기준값을 관리합니다.',
  codeLoadError: '근태코드 목록을 불러오지 못했습니다.',
  codeMutationError: '근태코드 저장 중 오류가 발생했습니다.',
  policyLoadError: '근무시간 설정을 불러오지 못했습니다.',
  policyMutationError: '근무시간 저장 중 오류가 발생했습니다.',
  employeeOptionsTab: '직원 항목',
  attendanceCodeTab: '근태코드',
  workTimeTab: '근무시간',
  holidayTab: '공휴일',
  attendanceTitle: '근태코드 관리',
  attendanceDescription: '지각, 조퇴, 결근, 연차 등 운영관리와 상세보기에서 사용할 근태코드를 관리합니다.',
  addAttendanceCode: '근태코드 추가',
};

const settingsTabs = [
  {
    label: TEXT.employeeOptionsTab,
    description: '직원 등록과 수정 화면에서 사용하는 직급, 근무유형, 재직상태를 관리합니다.',
  },
  {
    label: TEXT.attendanceCodeTab,
    description: '근태 일정과 자동판정 결과에 표시되는 근태코드를 관리합니다.',
  },
  {
    label: TEXT.workTimeTab,
    description: '일반근무와 반차의 출퇴근 기준시간을 관리합니다.',
  },
  {
    label: TEXT.holidayTab,
    description: '연도별 공휴일과 회사 지정 휴일을 관리합니다.',
  },
];

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
          {settingsTabs.map((tab) => <Tab key={tab.label} label={tab.label} />)}
        </Tabs>
      </Paper>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm font-semibold text-slate-800">{settingsTabs[settingsTab].label}</p>
        <p className="mt-1 text-sm text-slate-500">{settingsTabs[settingsTab].description}</p>
      </div>

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

      {settingsTab === 3 && <HolidaySettingsPanel />}

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


