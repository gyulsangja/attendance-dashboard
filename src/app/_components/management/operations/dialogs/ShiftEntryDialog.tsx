'use client';

import { useState } from 'react';
import {
  Alert,
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
import { shiftWorkers, type ShiftSchedule } from '@/mocks';

type Props = {
  open: boolean;
  existing: ShiftSchedule[];
  onClose: () => void;
  onSave: (items: ShiftSchedule[]) => void;
};

export default function ShiftEntryDialog({ open, existing, onClose, onSave }: Props) {
  const [workerIds, setWorkerIds] = useState<string[]>(['9']);
  const [startDate, setStartDate] = useState('2026-06-08');
  const [endDate, setEndDate] = useState('2026-06-13');
  const [shiftType, setShiftType] = useState('주간');

  const save = () => {
    const workers = shiftWorkers.filter((worker) =>
      workerIds.includes(String(worker.employeeId)),
    );
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    let nextId = Math.max(0, ...existing.map((item) => item.id)) + 1;
    const additions: ShiftSchedule[] = [];

    workers.forEach((worker) => {
      for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateKey = date.toISOString().slice(0, 10);
        if (!existing.some(
          (item) => item.employeeId === worker.employeeId && item.date === dateKey,
        )) {
          additions.push({
            id: nextId++,
            date: dateKey,
            employeeId: worker.employeeId,
            name: worker.name,
            shift: shiftType,
            time: shiftType === '주간'
              ? '08:00 ~ 20:00'
              : shiftType === '야간'
                ? '20:00 ~ 익일 08:00'
                : '-',
            status: '승인대기',
          });
        }
      }
    });

    onSave(additions);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>24시간 교대근무 일정 입력</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            지정된 기술팀 교대근무자에게 근무 형태를 기간 단위로 입력합니다.
          </Alert>
          <FormControl fullWidth>
            <InputLabel>교대근무자 (복수 선택)</InputLabel>
            <Select
              multiple
              value={workerIds}
              label="교대근무자 (복수 선택)"
              renderValue={(selected) => `${selected.length}명 선택`}
              onChange={(event) => setWorkerIds(
                typeof event.target.value === 'string'
                  ? event.target.value.split(',')
                  : event.target.value,
              )}
            >
              {shiftWorkers.map((worker) => (
                <MenuItem key={worker.employeeId} value={String(worker.employeeId)}>
                  {workerIds.includes(String(worker.employeeId)) ? '✓ ' : ''}
                  {worker.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="date"
              label="시작일"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="date"
              label="종료일"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>
          <FormControl fullWidth>
            <InputLabel>근무 형태</InputLabel>
            <Select
              value={shiftType}
              label="근무 형태"
              onChange={(event) => setShiftType(event.target.value)}
            >
              <MenuItem value="주간">주간 (08:00 ~ 20:00)</MenuItem>
              <MenuItem value="야간">야간 (20:00 ~ 익일 08:00)</MenuItem>
              <MenuItem value="휴무">휴무</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={startDate > endDate || !workerIds.length}
          onClick={save}
        >
          기간 일괄 입력
        </Button>
      </DialogActions>
    </Dialog>
  );
}
