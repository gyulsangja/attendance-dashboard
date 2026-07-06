'use client';

import {
  Alert,
  Button,
  Checkbox,
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
import {
  SHIFT_PRESETS,
  useShiftEntryDrafts,
} from '@/app/_components/management/operations/hooks/useShiftEntryDrafts';
import type { ShiftSchedule } from '@/types/domain';
import ShiftDraftList from './ShiftDraftList';

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
  const entry = useShiftEntryDrafts({ existing, workers, period });

  const save = () => {
    onSave(entry.drafts);
    entry.setDrafts([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>교대근무 일정 입력</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            근무자 1명과 기준시간, 여러 날짜를 선택해 일정을 추가하세요. 여러 묶음을 추가한 뒤 한 번에 저장할 수 있습니다.
          </Alert>

          {workers.length === 0 && (
            <Alert severity="warning">
              교대근무 대상자가 없습니다. 직원관리에서 교대근무 대상자를 먼저 설정하세요.
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>교대근무자</InputLabel>
            <Select
              value={entry.workerId}
              label="교대근무자"
              onChange={(event) => entry.setWorkerId(event.target.value)}
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
            value={entry.shiftType}
            onChange={(_, value) => value && entry.applyShiftType(value)}
          >
            {SHIFT_PRESETS.map((preset) => (
              <ToggleButton key={preset.value} value={preset.value}>
                {preset.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <FormGroup row sx={{ gap: 1 }}>
            {entry.weekDays.map((day) => (
              <FormControlLabel
                key={day.date}
                label={day.label}
                control={(
                  <Checkbox
                    checked={entry.selectedDates.includes(day.date)}
                    onChange={(event) => entry.toggleDate(day.date, event.target.checked)}
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
            <Button
              size="small"
              onClick={() => entry.setSelectedDates(entry.weekDays.map((day) => day.date))}
            >
              전체 선택
            </Button>
            <Button size="small" onClick={() => entry.setSelectedDates([])}>
              선택 해제
            </Button>
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              type="time"
              label="출근 기준시간"
              value={entry.checkIn}
              onChange={(event) => entry.setCheckIn(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              type="time"
              label="퇴근 기준시간"
              value={entry.checkOut}
              onChange={(event) => entry.setCheckOut(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Stack>

          <Button
            variant="outlined"
            disabled={workers.length === 0 || !entry.workerId || entry.selectedDates.length === 0 || !entry.checkIn || !entry.checkOut}
            onClick={entry.addDrafts}
          >
            선택 일정 추가
          </Button>

          <ShiftDraftList drafts={entry.drafts} onDelete={entry.removeDraft} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={workers.length === 0 || entry.drafts.length === 0}
          onClick={save}
        >
          {entry.drafts.length}건 저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
