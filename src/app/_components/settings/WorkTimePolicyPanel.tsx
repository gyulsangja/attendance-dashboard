import { Save } from '@mui/icons-material';
import { Button, Paper, TextField } from '@mui/material';
import type { WorkTimePolicy } from '@/store/slices/attendanceCodeSlice';

type WorkTimePolicyPanelProps = {
  policy: WorkTimePolicy;
  saving?: boolean;
  readOnly?: boolean;
  onPolicyChange: (policy: WorkTimePolicy) => void;
  onSave: () => void;
};

const TEXT = {
  basicWork: '기본 근무',
  halfAm: '오전 반차',
  halfPm: '오후 반차',
  title: '출퇴근 기준시간',
  description: '일반 근무와 반차의 출퇴근 기준시간을 설정합니다. 기준시간에 맞지 않는 출퇴근 기록은 백엔드 자동판정 기준에 따라 처리됩니다.',
  saving: '저장 중',
  save: '기준시간 저장',
  start: '출근 기준',
  end: '퇴근 기준',
};

const workTimeGroups = [
  { label: TEXT.basicWork, startKey: 'regularStart', endKey: 'regularEnd' },
  { label: TEXT.halfAm, startKey: 'halfAmStart', endKey: 'halfAmEnd' },
  { label: TEXT.halfPm, startKey: 'halfPmStart', endKey: 'halfPmEnd' },
] as const;

export default function WorkTimePolicyPanel({
  policy,
  saving = false,
  readOnly = false,
  onPolicyChange,
  onSave,
}: WorkTimePolicyPanelProps) {
  return (
    <Paper elevation={0} className="mt-5 border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-bold">{TEXT.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{TEXT.description}</p>
        </div>
        <Button variant="contained" startIcon={<Save />} disabled={saving || readOnly} onClick={onSave}>
          {saving ? TEXT.saving : TEXT.save}
        </Button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {workTimeGroups.map(({ label, startKey, endKey }) => (
          <div key={label} className="rounded-xl bg-slate-50 p-4">
            <p className="mb-3 font-bold">{label}</p>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                type="time"
                label={TEXT.start}
                value={policy[startKey]}
                disabled={readOnly}
                onChange={(event) => onPolicyChange({ ...policy, [startKey]: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                type="time"
                label={TEXT.end}
                value={policy[endKey]}
                disabled={readOnly}
                onChange={(event) => onPolicyChange({ ...policy, [endKey]: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </div>
          </div>
        ))}
      </div>
    </Paper>
  );
}
