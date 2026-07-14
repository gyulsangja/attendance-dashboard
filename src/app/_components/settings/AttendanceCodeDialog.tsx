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
  editTitle: '근태코드 수정',
  addTitle: '근태코드 추가',
  label: '근태코드명',
  labelPlaceholder: '예: 병가, 연차, 결근',
  exceptional: '상세보기와 대시보드에 특이근태로 표시',
  effectiveDate: '변경 적용일',
  startDate: '사용 시작일',
  cancel: '취소',
  save: '저장',
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyCode = (): AttendanceCode => ({
  id: '',
  label: '',
  isActive: true,
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
