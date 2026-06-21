'use client';

import { Alert, Button } from '@mui/material';
import { Edit, PublishedWithChanges } from '@mui/icons-material';
import type { OperationStep } from './OperationProgress';

export default function ConfirmPanel({ steps, confirmed, csvUploaded, pendingShifts, onToggle }: { steps: OperationStep[]; confirmed: boolean; csvUploaded: boolean; pendingShifts: number; onToggle: () => void; }) {
  return <div className="mx-auto max-w-2xl py-6">
    <h2 className="text-xl font-bold">주간 운영관리 확정</h2>
    <p className="mt-2 text-slate-500">근태 일정, 단말기 데이터, 교대근무 검토가 완료되면 현황통계에 반영합니다.</p>
    <div className="mt-6 space-y-3 rounded-xl bg-slate-50 p-5">{steps.slice(0, 3).map((step) => <div key={step.label} className="flex justify-between">
      <span>{step.label}</span>
      <strong>{step.value}</strong>
    </div>)}</div>{pendingShifts > 0 && <Alert severity="warning" sx={{ mt: 3 }}>확정되지 않은 교대근무 일정이 {pendingShifts}건 있습니다.</Alert>}<Button fullWidth size="large" variant="contained" startIcon={confirmed ? <Edit /> : <PublishedWithChanges />} disabled={!csvUploaded || pendingShifts > 0} onClick={onToggle} sx={{ mt: 3, bgcolor: confirmed ? '#475569' : '#0f172a' }}>{confirmed ? '확정 해제 후 수정' : '운영관리 확정 및 현황통계 반영'}</Button>
  </div>;
}
