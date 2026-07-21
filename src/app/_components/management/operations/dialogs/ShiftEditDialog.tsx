'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import type { ShiftSchedule } from '@/types/domain';
import { SHIFT_PRESETS } from '../hooks/useShiftEntryDrafts';

type Props = {
  value: ShiftSchedule | null;
  onClose: () => void;
  onSave: (value: ShiftSchedule) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
};

const getShiftLabel = (checkIn: string, checkOut: string) =>
  `${checkIn} ~ ${checkOut <= checkIn ? '익일 ' : ''}${checkOut}`;

function ShiftEditDialogForm({ value, onClose, onSave, onDelete }: Props & { value: ShiftSchedule }) {
  const [form, setForm] = useState<ShiftSchedule | null>(value);
  const [saving, setSaving] = useState(false);

  const setTimes = (shift: string) => {
    if (!form) return;

    const preset = SHIFT_PRESETS.find((item) => item.value === shift);
    if (!preset) return;

    setForm({
      ...form,
      shift: preset.value,
      checkIn: preset.checkIn,
      checkOut: preset.checkOut,
      time: getShiftLabel(preset.checkIn, preset.checkOut),
    });
  };

  return (
    <Dialog open={Boolean(value)} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>교대근무 일정 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="구성원" value={form?.name ?? ''} disabled />
          <TextField label="근무일" value={form?.date ?? ''} disabled />
          <FormControl fullWidth>
            <InputLabel>기준시간 선택</InputLabel>
            <Select
              value={form?.shift ?? SHIFT_PRESETS[0].value}
              label="기준시간 선택"
              onChange={(event) => setTimes(event.target.value)}
            >
              {SHIFT_PRESETS.map((preset) => (
                <MenuItem key={preset.value} value={preset.value}>
                  {preset.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
        <Button
          color="error"
          onClick={() => {
            if (form && window.confirm('이 교대근무 일정을 삭제하시겠습니까?')) onDelete(form.id);
          }}
        >
          일정 삭제
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={onClose}>취소</Button>
          <Button
            variant="contained"
            disabled={saving || !form?.shift}
            onClick={async () => {
              if (!form) return;
              setSaving(true);
              try {
                await onSave(form);
              } finally {
                setSaving(false);
              }
            }}
          >
            수정 저장
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default function ShiftEditDialog(props: Props) {
  if (!props.value) return null;

  return <ShiftEditDialogForm key={props.value.id} {...props} value={props.value} />;
}
