'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import type { AttendanceCode } from '@/types/domain';

type Props = {
  open: boolean;
  code: AttendanceCode | null;
  onClose: () => void;
  onSave: (code: AttendanceCode, effectiveDate: string) => void;
};

const TEXT = {
  editTitle: '\uadfc\ud0dc\ucf54\ub4dc \uc218\uc815',
  addTitle: '\uadfc\ud0dc\ucf54\ub4dc \ucd94\uac00',
  label: '\uadfc\ud0dc\ucf54\ub4dc\uba85',
  labelPlaceholder: '\uc608: \ubcd1\uac00',
  schedulable: '\uc6b4\uc601\uad00\ub9ac\uc5d0\uc11c \uc77c\uc815 \uc785\ub825 \uac00\ub2a5',
  exceptional: '\ub300\uc2dc\ubcf4\ub4dc\uc5d0 \ud2b9\uc774\uadfc\ud0dc\ub85c \ud45c\uc2dc',
  effectiveDate: '\ubcc0\uacbd \uc801\uc6a9\uc77c',
  startDate: '\uc0ac\uc6a9 \uc2dc\uc791\uc77c',
  cancel: '\ucde8\uc18c',
  save: '\uc800\uc7a5',
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyCode = (): AttendanceCode => ({
  id: '',
  label: '',
  isActive: true,
  isSchedulable: true,
  isExceptional: false,
  startDate: today(),
});

export default function AttendanceCodeDialog({ open, code, onClose, onSave }: Props) {
  const [form, setForm] = useState<AttendanceCode>(() => (code ? { ...code } : emptyCode()));
  const [effectiveDate, setEffectiveDate] = useState(today());

  const dateValue = code ? effectiveDate : form.startDate;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{code ? TEXT.editTitle : TEXT.addTitle}</DialogTitle>
      <DialogContent className="space-y-4 pt-3!">
        <TextField
          fullWidth
          label={TEXT.label}
          placeholder={TEXT.labelPlaceholder}
          value={form.label}
          onChange={(event) => setForm({ ...form, label: event.target.value })}
        />

        <FormControlLabel
          control={(
            <Switch
              checked={form.isSchedulable}
              onChange={(event) => setForm({ ...form, isSchedulable: event.target.checked })}
            />
          )}
          label={TEXT.schedulable}
        />

        <FormControlLabel
          control={(
            <Switch
              checked={form.isExceptional}
              onChange={(event) => setForm({ ...form, isExceptional: event.target.checked })}
            />
          )}
          label={TEXT.exceptional}
        />

        <TextField
          fullWidth
          type="date"
          label={code ? TEXT.effectiveDate : TEXT.startDate}
          value={dateValue}
          onChange={(event) => {
            if (code) setEffectiveDate(event.target.value);
            else setForm({ ...form, startDate: event.target.value });
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>{TEXT.cancel}</Button>
        <Button
          variant="contained"
          disabled={!form.label.trim()}
          onClick={() => onSave(
            { ...form, id: form.id.trim(), label: form.label.trim() },
            dateValue,
          )}
        >
          {TEXT.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}


