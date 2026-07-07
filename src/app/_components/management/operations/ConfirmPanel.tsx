'use client';

import { useState } from 'react';
import { Alert, Button, Stack } from '@mui/material';
import {
  Edit,
  PublishedWithChanges,
  Summarize,
} from '@mui/icons-material';
import type { OperationWeeklyReport } from '@/selectors/operationWeeklyReportSelectors';
import type { OperationStep } from './OperationProgress';
import WeeklyReportDialog from './WeeklyReportDialog';

type ConfirmPanelProps = {
  steps: OperationStep[];
  confirmed: boolean;
  csvUploaded: boolean;
  pendingShifts: number;
  weeklyReport: OperationWeeklyReport;
  onToggle: () => void;
};

export default function ConfirmPanel({
  steps,
  confirmed,
  csvUploaded,
  pendingShifts,
  weeklyReport,
  onToggle,
}: ConfirmPanelProps) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h2 className="text-xl font-bold">주간 운영관리 확정</h2>
      <p className="mt-2 text-slate-500">
        근태 일정, 단말기 데이터, 교대근무 검토가 완료되면 상세보기에 반영합니다.
      </p>
      <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-5">
        {steps.slice(0, 3).map((step) => (
          <div key={step.label} className="flex justify-between">
            <span>{step.label}</span>
            <strong>{step.value}</strong>
          </div>
        ))}
      </div>
      {pendingShifts > 0 && (
        <Alert severity="warning" sx={{ mt: 3 }}>
          확정되지 않은 교대근무 일정이 {pendingShifts}건 있습니다.
        </Alert>
      )}
      <Stack spacing={1.5} sx={{ mt: 3 }}>
        <Button
          fullWidth
          size="large"
          variant="contained"
          startIcon={confirmed ? <Edit /> : <PublishedWithChanges />}
          disabled={!csvUploaded || pendingShifts > 0}
          onClick={onToggle}
          sx={{ bgcolor: confirmed ? '#475569' : '#0f172a' }}
        >
          {confirmed ? '확정 해제 후 수정' : '운영관리 확정 및 상세보기 반영'}
        </Button>
        {confirmed && (
          <Button
            fullWidth
            size="large"
            variant="outlined"
            startIcon={<Summarize />}
            onClick={() => setReportOpen(true)}
          >
            주간보고 미리보기
          </Button>
        )}
      </Stack>
      <WeeklyReportDialog
        open={reportOpen}
        report={weeklyReport}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
