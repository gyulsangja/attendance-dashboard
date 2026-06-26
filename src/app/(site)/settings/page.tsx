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
  noAccess: '\uad8c\ud55c\uc73c\ub85c\ub294 \uc124\uc815\uc744 \uad00\ub9ac\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.',
  endDatePrompt: '\uc0ac\uc6a9 \uc885\ub8cc\uc77c\uc744 \uc785\ub825\ud558\uc138\uc694.',
  title: '\uc124\uc815',
  description: '\uc9c1\uc6d0 \uc815\ubcf4 \ud56d\ubaa9, \uadfc\ud0dc\ucf54\ub4dc, \ucd9c\ud1f4\uadfc \uae30\uc900\uc2dc\uac04\uc744 \uc5c5\ubb34\ubcc4\ub85c \uad00\ub9ac\ud569\ub2c8\ub2e4.',
  apiInfo: 'API \ubaa8\ub4dc\uc5d0\uc11c\ub294 \uc124\uc815\ud55c \ud56d\ubaa9\ub4e4\uc744 \ubc31\uc5d4\ub4dc API\uc5d0 \uc800\uc7a5\ud569\ub2c8\ub2e4. \uc800\uc7a5 \ud6c4 \ubaa9\ub85d\uc5d0 \ubc18\uc601\ub418\uc9c0 \uc54a\uc73c\uba74 \ubc31\uc5d4\ub4dc \uc800\uc7a5 \ud544\ub4dc \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.',
  codeLoadError: '\uadfc\ud0dc\ucf54\ub4dc API\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud574 \ud504\ub860\ud2b8 \uae30\ubcf8 \ub370\uc774\ud130\ub97c \ud45c\uc2dc\ud569\ub2c8\ub2e4.',
  codeMutationError: '\uadfc\ud0dc\ucf54\ub4dc \uc800\uc7a5 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \ubc31\uc5d4\ub4dc \uacf5\ud1b5\ucf54\ub4dc \uc800\uc7a5 DTO \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.',
  policyLoadError: '\uc2dc\uc2a4\ud15c \uc124\uc815 API\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud574 \ud504\ub860\ud2b8 \uae30\ubcf8 \uae30\uc900\uc2dc\uac04\uc744 \uc0ac\uc6a9\ud569\ub2c8\ub2e4.',
  policyMutationError: '\uae30\uc900\uc2dc\uac04 \uc800\uc7a5 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \ubc31\uc5d4\ub4dc \uc2dc\uc2a4\ud15c \uc124\uc815 API \uad6c\ud604 \uc5ec\ubd80 \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.',
  employeeOptionsTab: '\uc9c1\uc6d0 \uc815\ubcf4 \ud56d\ubaa9',
  attendanceCodeTab: '\uadfc\ud0dc\ucf54\ub4dc',
  workTimeTab: '\uadfc\ubb34\uc2dc\uac04',
  attendanceTitle: '\uadfc\ud0dc\ucf54\ub4dc \uad00\ub9ac',
  attendanceDescription: '\uc9c0\uac01, \uc870\ud1f4, \uacb0\uadfc, \uc5f0\ucc28 \ub4f1 \uc6b4\uc601\uad00\ub9ac\uc640 \ub300\uc2dc\ubcf4\ub4dc\uc5d0\uc11c \uc0ac\uc6a9\ud560 \uadfc\ud0dc\ucf54\ub4dc\ub97c \uad00\ub9ac\ud569\ub2c8\ub2e4.',
  addAttendanceCode: '\uadfc\ud0dc\ucf54\ub4dc \ucd94\uac00',
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
  const sourceCodes = isApiDataSource && apiCodes.length > 0 ? apiCodes : codes;
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
          readOnly={isApiDataSource}
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

