'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
} from '@mui/material';
import { type ShiftSchedule } from '@/mocks';
import { formatDateKey } from '@/lib/date';

type Props = {
  open: boolean;
  existing: ShiftSchedule[];
  workers: { employeeId: number; name: string }[];
  period: { startDate: string; endDate: string };
  onClose: () => void;
  onSave: (items: ShiftSchedule[]) => void;
};

export default function ShiftEntryDialog({
  open,
  existing,
  workers,
  period,
  onClose,
  onSave,
}: Props) {
  const weekDays = useMemo(() => {
    const days: Array<{ date: string; label: string }> = [];
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const end = new Date(`${period.endDate}T00:00:00`);
    for (
      const current = new Date(`${period.startDate}T00:00:00`);
      current <= end;
      current.setDate(current.getDate() + 1)
    ) {
      days.push({
        date: formatDateKey(current),
        label: `${current.getMonth() + 1}/${current.getDate()} (${weekdays[current.getDay()]})`,
      });
    }
    return days;
  }, [period.endDate, period.startDate]);
  const [workerId, setWorkerId] = useState<string>(
    workers[0] ? String(workers[0].employeeId) : '',
  );
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [shiftType, setShiftType] = useState('주간');
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('18:00');
  const [drafts, setDrafts] = useState<ShiftSchedule[]>([]);

  const applyShiftType = (value: string) => {
    setShiftType(value);
    if (value === '주간') {
      setCheckIn('09:00');
      setCheckOut('18:00');
    } else if (value === '오후') {
      setCheckIn('12:00');
      setCheckOut('21:00');
    } else {
      setCheckIn('21:00');
      setCheckOut('09:00');
    }
  };

  const addDrafts = () => {
    const worker = workers.find((item) => String(item.employeeId) === workerId);
    if (!worker || selectedDates.length === 0) return;
    const maxId = Math.max(
      0,
      ...existing.map((item) => item.id),
      ...drafts.map((item) => item.id),
    );
    let nextId = maxId + 1;
    const nextDrafts = selectedDates.sort().map((date) => {
      const existingSchedule = existing.find(
        (item) => item.employeeId === worker.employeeId && item.date === date,
      );
      return {
        id: existingSchedule?.id ?? nextId++,
        date,
        employeeId: worker.employeeId,
        name: worker.name,
        shift: shiftType,
        time: `${checkIn} ~ ${checkOut <= checkIn ? '익일 ' : ''}${checkOut}`,
        checkIn,
        checkOut,
        status: '승인대기',
      };
    });
    setDrafts((current) => {
      const draftMap = new Map(
        current.map((item) => [`${item.employeeId}-${item.date}`, item]),
      );
      nextDrafts.forEach((item) => draftMap.set(`${item.employeeId}-${item.date}`, item));
      return [...draftMap.values()].sort(
        (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name),
      );
    });
    setSelectedDates([]);
  };

  const save = () => {
    onSave(drafts);
    setDrafts([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>24시간 교대근무 일정 입력</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            한 명의 근무자에게 기준시간과 여러 날짜를 선택해 추가하세요. 여러 묶음을 추가한 뒤 한 번에 저장할 수 있습니다.
          </Alert>
          <FormControl fullWidth>
            <InputLabel>교대근무자</InputLabel>
            <Select
              value={workerId}
              label="교대근무자"
              onChange={(event) => setWorkerId(event.target.value)}
            >
              {workers.map((worker) => (
                <MenuItem key={worker.employeeId} value={String(worker.employeeId)}>
                  {worker.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={shiftType}
            onChange={(_, value) => value && applyShiftType(value)}
          >
            <ToggleButton value="주간">
              09:00~18:00
            </ToggleButton>
            <ToggleButton value="오후">
              12:00~21:00
            </ToggleButton>
            <ToggleButton value="야간">
              21:00~익일 09:00
            </ToggleButton>
          </ToggleButtonGroup>

          <FormGroup row sx={{ gap: 1 }}>
            {weekDays.map((day) => (
              <FormControlLabel
                key={day.date}
                label={day.label}
                control={(
                  <Checkbox
                    checked={selectedDates.includes(day.date)}
                    onChange={(event) => setSelectedDates((current) =>
                      event.target.checked
                        ? [...current, day.date].sort()
                        : current.filter((item) => item !== day.date)
                    )}
                  />
                )}
                sx={{
                  m: 0,
                  minWidth: 112,
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  px: 1,
                }}
              />
            ))}
          </FormGroup>
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => setSelectedDates(weekDays.map((day) => day.date))}>
              전체 선택
            </Button>
            <Button size="small" onClick={() => setSelectedDates([])}>
              선택 해제
            </Button>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="time"
              label="출근 기준시간"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="time"
              label="퇴근 기준시간"
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <Button
            variant="outlined"
            disabled={!workerId || selectedDates.length === 0 || !checkIn || !checkOut}
            onClick={addDrafts}
          >
            선택 일정 추가
          </Button>

          <div className="max-h-52 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {drafts.length > 0 ? (
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {drafts.map((draft) => (
                  <Chip
                    key={`${draft.employeeId}-${draft.date}`}
                    label={`${draft.name} · ${draft.date} · ${draft.time}`}
                    onDelete={() => setDrafts((current) => current.filter(
                      (item) => !(item.employeeId === draft.employeeId && item.date === draft.date),
                    ))}
                  />
                ))}
              </Stack>
            ) : (
              <p className="py-6 text-center text-sm text-slate-400">
                추가된 일정이 없습니다.
              </p>
            )}
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={drafts.length === 0}
          onClick={save}
        >
          {drafts.length}건 저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
