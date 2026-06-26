'use client';

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
  basicWork: '\uae30\ubcf8 \uadfc\ubb34',
  halfAm: '\uc624\uc804 \ubc18\ucc28',
  halfPm: '\uc624\ud6c4 \ubc18\ucc28',
  title: '\uc77c\ubc18 \uadfc\ubb34 \ucd9c\ud1f4\uadfc \uae30\uc900\uc2dc\uac04',
  description: 'CSV \uc5c5\ub85c\ub4dc \ud6c4 \uc77c\ubc18 \uad6c\uc131\uc6d0\uc758 \uc9c0\uac01, \uc870\ud1f4 \uc790\ub3d9\ud310\uc815\uc5d0 \uc0ac\uc6a9\ud569\ub2c8\ub2e4. \uad50\ub300\uadfc\ubb34\uc790\ub294 \uad50\ub300 \uc77c\uc815\uc758 \uae30\uc900\uc2dc\uac04\uc744 \uc0ac\uc6a9\ud569\ub2c8\ub2e4.',
  saving: '\uc800\uc7a5 \uc911',
  save: '\uae30\uc900\uc2dc\uac04 \uc800\uc7a5',
  start: '\ucd9c\uadfc \uae30\uc900',
  end: '\ud1f4\uadfc \uae30\uc900',
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
