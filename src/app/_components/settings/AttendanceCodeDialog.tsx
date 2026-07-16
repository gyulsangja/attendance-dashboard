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
  code: '관리코드',
  codePlaceholder: '예: ATT07',
  codeHelper: '등록 후에는 출퇴근/근태 기록에서 참조되므로 변경하지 않습니다.',
  label: '근태코드명',
  labelPlaceholder: '예: 연차, 병가, 지각',
  active: '사용',
  sortOrder: '표시 순서',
  etc: '비고',
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
  sortOrder: 99,
  etc: '',
});

export default function AttendanceCodeDialog({ open, code, onClose, onSave }: Props) {
  const [form, setForm] = useState<AttendanceCode>(() => (code ? { ...code } : emptyCode()));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{code ? TEXT.editTitle : TEXT.addTitle}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1.5 }}>
        <TextField
          fullWidth
          label={TEXT.code}
          placeholder={TEXT.codePlaceholder}
          value={form.id}
          disabled={Boolean(code)}
          helperText={TEXT.codeHelper}
          onChange={(event) => setForm({ ...form, id: event.target.value.trim().toUpperCase() })}
        />

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
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
          )}
          label={TEXT.active}
        />

        <TextField
          fullWidth
          type="number"
          label={TEXT.sortOrder}
          value={form.sortOrder ?? 99}
          onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) || 99 })}
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          label={TEXT.etc}
          value={form.etc ?? ''}
          onChange={(event) => setForm({ ...form, etc: event.target.value })}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>{TEXT.cancel}</Button>
        <Button
          variant="contained"
          disabled={!form.id.trim() || !form.label.trim()}
          onClick={() => onSave(
            { ...form, id: form.id.trim(), label: form.label.trim(), etc: form.etc?.trim() ?? '' },
            today(),
          )}
        >
          {TEXT.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
