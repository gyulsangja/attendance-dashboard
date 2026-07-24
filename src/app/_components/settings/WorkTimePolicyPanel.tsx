import { Save } from '@mui/icons-material';
import { Alert, Button, Paper, TextField } from '@mui/material';
import type { WorkTimePolicy } from '@/store/slices/attendanceCodeSlice';

type WorkTimePolicyPanelProps = {
  policy: WorkTimePolicy;
  saving?: boolean;
  saveMessage?: string;
  errorMessage?: string;
  readOnly?: boolean;
  onPolicyChange: (policy: WorkTimePolicy) => void;
  onSave: () => void;
};

const TEXT = {
  title: '근무시간 설정',
  description: '일반근무와 반차의 출퇴근 기준시간을 설정합니다.',
  basicWork: '일반근무',
  halfAm: '오전반차',
  halfPm: '오후반차',
  saving: '저장 중',
  save: '저장',
  regularStart: '출근 기준시간',
  regularEnd: '퇴근 기준시간',
  halfAmStart: '오전반차 출근 시간',
  halfPmStart: '오후반차 퇴근 시간',
};

export default function WorkTimePolicyPanel({
  policy,
  saving = false,
  saveMessage = '',
  errorMessage = '',
  readOnly = false,
  onPolicyChange,
  onSave,
}: WorkTimePolicyPanelProps) {
  return (
    <section className="mt-5 space-y-4">
      <Paper elevation={0} className="border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">{TEXT.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{TEXT.description}</p>
          </div>
          <Button variant="contained" startIcon={<Save />} disabled={saving || readOnly} onClick={onSave}>
            {saving ? TEXT.saving : TEXT.save}
          </Button>
        </div>
        {saveMessage && <Alert severity="success" sx={{ mt: 2 }}>{saveMessage}</Alert>}
        {errorMessage && <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>}
      </Paper>

      <div className="grid gap-4 md:grid-cols-3">
        <Paper elevation={0} className="border border-slate-200 bg-white p-5">
          <p className="text-base font-bold">{TEXT.basicWork}</p>
          <p className="mt-1 min-h-10 text-sm text-slate-500">일반근무자의 기본 출퇴근 기준시간입니다.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <TextField
              type="time"
              label={TEXT.regularStart}
              value={policy.regularStart}
              disabled={readOnly}
              onChange={(event) => onPolicyChange({ ...policy, regularStart: event.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type="time"
              label={TEXT.regularEnd}
              value={policy.regularEnd}
              disabled={readOnly}
              onChange={(event) => onPolicyChange({ ...policy, regularEnd: event.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </div>
        </Paper>

        <Paper elevation={0} className="border border-slate-200 bg-white p-5">
          <p className="text-base font-bold">{TEXT.halfAm}</p>
          <p className="mt-1 min-h-10 text-sm text-slate-500">오전반차 사용자의 출근 기준시간입니다.</p>
          <TextField
            fullWidth
            type="time"
            label={TEXT.halfAmStart}
            value={policy.halfAmStart}
            disabled={readOnly}
            onChange={(event) => onPolicyChange({ ...policy, halfAmStart: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mt: 2 }}
          />
        </Paper>

        <Paper elevation={0} className="border border-slate-200 bg-white p-5">
          <p className="text-base font-bold">{TEXT.halfPm}</p>
          <p className="mt-1 min-h-10 text-sm text-slate-500">오후반차 사용자의 퇴근 기준시간입니다.</p>
          <TextField
            fullWidth
            type="time"
            label={TEXT.halfPmStart}
            value={policy.halfPmStart}
            disabled={readOnly}
            onChange={(event) => onPolicyChange({ ...policy, halfPmStart: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mt: 2 }}
          />
        </Paper>
      </div>
    </section>
  );
}
