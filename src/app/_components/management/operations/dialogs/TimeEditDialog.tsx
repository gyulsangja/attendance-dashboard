'use client';

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
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import { isApiDataSource } from '@/repositories/config';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import { getOrganizationSnapshot } from '@/store/slices/organizationSlice';

export type EditingTime = {
  recordId?: number;
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut: string;
  employeeName?: string;
  department?: string;
  position?: string;
  attendanceCodeIds: string[];
};

type Props = {
  value: EditingTime | null;
  onChange: (value: EditingTime | null) => void;
  onSave: () => void;
  saving?: boolean;
  error?: boolean;
};

const TEXT = {
  title: '출퇴근 시간 수정',
  employee: '직원',
  date: '일자',
  checkIn: '출근시간',
  checkOut: '퇴근시간',
  result: '근태 결과',
  emptyResult: '선택 안 함',
  guide: '출퇴근 시간과 최종 근태 결과를 함께 수정할 수 있습니다.',
  codeLoading: '근태코드를 불러오는 중입니다.',
  codeError: '근태코드 API를 불러오지 못했습니다.',
  saveError: '출퇴근 정보 수정에 실패했습니다.',
  cancel: '취소',
  save: '수정 저장',
};

export default function TimeEditDialog({
  value,
  onChange,
  onSave,
  saving = false,
  error = false,
}: Props) {
  const organization = useAppSelector((state) => state.organization);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const date = value?.date ?? new Date().toISOString().slice(0, 10);
  const attendanceCodes = isApiDataSource
    ? apiAttendanceCodesQuery.data ?? []
    : getAttendanceCodesAtDate(
      codeMaster.codes,
      codeMaster.history,
      date,
    );
  const employees = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    date,
  ).employees;

  return (
    <Dialog open={Boolean(value)} onClose={() => onChange(null)} fullWidth maxWidth="xs">
      <DialogTitle>{TEXT.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{TEXT.saveError}</Alert>}
          <TextField
            label={TEXT.employee}
            value={
              value?.employeeName
              ?? employees.find((item) => item.id === value?.employeeId)?.name
              ?? ''
            }
            disabled
          />
          <TextField label={TEXT.date} value={value?.date ?? ''} disabled />
          <TextField
            type="time"
            label={TEXT.checkIn}
            value={value?.checkIn ?? ''}
            onChange={(event) => value && onChange({
              ...value,
              checkIn: event.target.value,
            })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="time"
            label={TEXT.checkOut}
            value={value?.checkOut ?? ''}
            onChange={(event) => value && onChange({
              ...value,
              checkOut: event.target.value,
            })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Alert severity="info">{TEXT.guide}</Alert>
          {isApiDataSource && apiAttendanceCodesQuery.isLoading && (
            <Alert severity="info">{TEXT.codeLoading}</Alert>
          )}
          {isApiDataSource && apiAttendanceCodesQuery.isError && (
            <Alert severity="warning">{TEXT.codeError}</Alert>
          )}
          <FormControl fullWidth>
            <InputLabel id="attendance-result-label">{TEXT.result}</InputLabel>
            <Select
              labelId="attendance-result-label"
              label={TEXT.result}
              value={value?.attendanceCodeIds[0] ?? ''}
              onChange={(event) => {
                if (!value) return;
                const codeId = event.target.value;
                onChange({
                  ...value,
                  attendanceCodeIds: codeId ? [codeId] : [],
                });
              }}
            >
              <MenuItem value="">{TEXT.emptyResult}</MenuItem>
              {attendanceCodes.map((code) => (
                <MenuItem key={code.id} value={code.id}>
                  {code.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => onChange(null)} disabled={saving}>{TEXT.cancel}</Button>
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {TEXT.save}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
