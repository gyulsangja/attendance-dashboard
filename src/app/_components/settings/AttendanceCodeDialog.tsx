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
import type { AttendanceCode } from '@/mocks';

type Props = {
  open: boolean;
  code: AttendanceCode | null;
  onClose: () => void;
  onSave: (code: AttendanceCode, effectiveDate: string) => void;
};

const emptyCode = (): AttendanceCode => ({
  id: '',
  label: '',
  isActive: true,
  isSchedulable: true,
  isExceptional: false,
  startDate: new Date().toISOString().slice(0, 10),
});

export default function AttendanceCodeDialog({ open, code, onClose, onSave }: Props) {
  const [form, setForm] = useState<AttendanceCode>(() =>
    code ? { ...code } : emptyCode()
  );
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{code ? '근태코드 수정' : '근태코드 추가'}</DialogTitle>
      <DialogContent className="space-y-4 pt-3!">
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="코드 ID"
            placeholder="예: FAMILY_EVENT"
            value={form.id}
            disabled={Boolean(code)}
            onChange={(event) => setForm({
              ...form,
              id: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
            })}
          />
          <TextField
            label="표시명"
            placeholder="예: 경조휴가"
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
          />
        </div>

        <FormControlLabel
          control={(
            <Switch
              checked={form.isSchedulable}
              onChange={(event) => setForm({ ...form, isSchedulable: event.target.checked })}
            />
          )}
          label="운영관리에서 일정 입력 가능"
        />

        <FormControlLabel
          control={(
            <Switch
              checked={form.isExceptional}
              onChange={(event) => setForm({
                ...form,
                isExceptional: event.target.checked,
              })}
            />
          )}
          label="대시보드에 특이근태로 표시"
        />

        <TextField
          fullWidth
          type="date"
          label={code ? '변경 적용일' : '사용 시작일'}
          value={code ? effectiveDate : form.startDate}
          onChange={(event) => code
            ? setEffectiveDate(event.target.value)
            : setForm({ ...form, startDate: event.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={!form.id.trim() || !form.label.trim()}
          onClick={() => onSave(
            { ...form, id: form.id.trim(), label: form.label.trim() },
            code ? effectiveDate : form.startDate,
          )}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
