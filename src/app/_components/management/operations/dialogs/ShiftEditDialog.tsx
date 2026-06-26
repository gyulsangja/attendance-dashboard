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

type Props = {
  value: ShiftSchedule | null;
  onClose: () => void;
  onSave: (value: ShiftSchedule) => void;
  onDelete: (id: number) => void;
};

export default function ShiftEditDialog({ value, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<ShiftSchedule | null>(value);

  const setTimes = (shift: string) => {
    if (!form) return;
    const defaults = shift === '주간'
      ? { checkIn: '09:00', checkOut: '18:00' }
      : shift === '오후'
        ? { checkIn: '12:00', checkOut: '21:00' }
        : { checkIn: '21:00', checkOut: '09:00' };
    const { checkIn, checkOut } = defaults;
    setForm({
      ...form,
      shift,
      checkIn,
      checkOut,
      time: `${checkIn} ~ ${checkOut <= checkIn ? '익일 ' : ''}${checkOut}`,
    });
  };

  const updateTime = (field: 'checkIn' | 'checkOut', time: string) => {
    if (!form) return;
    const next = { ...form, [field]: time };
    const checkIn = next.checkIn ?? '';
    const checkOut = next.checkOut ?? '';
    setForm({
      ...next,
      time: `${checkIn} ~ ${checkOut <= checkIn ? '익일 ' : ''}${checkOut}`,
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
              value={form?.shift ?? '주간'}
              label="기준시간 선택"
              onChange={(event) => setTimes(event.target.value)}
            >
              <MenuItem value="주간">09:00 ~ 18:00</MenuItem>
              <MenuItem value="오후">12:00 ~ 21:00</MenuItem>
              <MenuItem value="야간">21:00 ~ 익일 09:00</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="time"
              label="출근 기준시간"
              value={form?.checkIn ?? ''}
              onChange={(event) => updateTime('checkIn', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="time"
              label="퇴근 기준시간"
              value={form?.checkOut ?? ''}
              onChange={(event) => updateTime('checkOut', event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
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
            disabled={!form?.checkIn || !form?.checkOut}
            onClick={() => form && onSave(form)}
          >
            수정 저장
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
