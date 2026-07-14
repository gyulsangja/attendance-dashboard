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
  title: '근무시간 설정',
  description: '일반근무와 반차의 출퇴근 기준시간을 설정합니다. 저장된 기준시간은 백엔드 자동판정 기준으로 사용됩니다.',
  basicWork: '일반근무',
  halfAm: '오전반차',
  halfPm: '오후반차',
  saving: '저장 중',
  save: '저장',
  start: '출근 기준',
  end: '퇴근 기준',
};

const workTimeGroups = [
  {
    label: TEXT.basicWork,
    description: '일반 직원의 기본 출퇴근 기준시간입니다.',
    startKey: 'regularStart',
    endKey: 'regularEnd',
  },
  {
    label: TEXT.halfAm,
    description: '오전반차 사용자의 출퇴근 판단 기준입니다.',
    startKey: 'halfAmStart',
    endKey: 'halfAmEnd',
  },
  {
    label: TEXT.halfPm,
    description: '오후반차 사용자의 출퇴근 판단 기준입니다.',
    startKey: 'halfPmStart',
    endKey: 'halfPmEnd',
  },
] as const;

export default function WorkTimePolicyPanel({
  policy,
  saving = false,
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
      </Paper>

      <div className="grid gap-4 md:grid-cols-3">
        {workTimeGroups.map(({ label, description, startKey, endKey }) => (
          <Paper key={label} elevation={0} className="border border-slate-200 bg-white p-5">
            <p className="text-base font-bold">{label}</p>
            <p className="mt-1 min-h-10 text-sm text-slate-500">{description}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
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
          </Paper>
        ))}
      </div>
    </section>
  );
}
