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
};

export default function TimeEditDialog({
  value,
  onChange,
  onSave,
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
      <DialogTitle>출퇴근 시간 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="직원"
            value={
              value?.employeeName
              ?? employees.find((item) => item.id === value?.employeeId)?.name
              ?? ''
            }
            disabled
          />
          <TextField label="일자" value={value?.date ?? ''} disabled />
          <TextField
            type="time"
            label="출근시간"
            value={value?.checkIn ?? ''}
            onChange={(event) => value && onChange({
              ...value,
              checkIn: event.target.value,
            })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="time"
            label="퇴근시간"
            value={value?.checkOut ?? ''}
            onChange={(event) => value && onChange({
              ...value,
              checkOut: event.target.value,
            })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Alert severity="info">
            출퇴근 시간과 최종 근태 결과를 함께 수정할 수 있습니다.
          </Alert>
          {isApiDataSource && apiAttendanceCodesQuery.isLoading && (
            <Alert severity="info">근태코드를 불러오는 중입니다.</Alert>
          )}
          {isApiDataSource && apiAttendanceCodesQuery.isError && (
            <Alert severity="warning">근태코드 API를 불러오지 못했습니다.</Alert>
          )}
          <FormControl fullWidth>
            <InputLabel id="attendance-result-label">근태 결과</InputLabel>
            <Select
              labelId="attendance-result-label"
              label="근태 결과"
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
              <MenuItem value="">선택 안 함</MenuItem>
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
          <Button onClick={() => onChange(null)}>취소</Button>
          <Button variant="contained" onClick={onSave}>수정 저장</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
