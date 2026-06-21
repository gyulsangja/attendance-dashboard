'use client';

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
import { type OperationSchedule } from '@/mocks';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';

type Props = {
  value: OperationSchedule | null;
  onChange: (value: OperationSchedule | null) => void;
  onSave: () => void;
};

export default function ScheduleEditDialog({ value, onChange, onSave }: Props) {
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const attendanceCodes = getAttendanceCodesAtDate(
    codeMaster.codes,
    codeMaster.history,
    value?.date ?? new Date().toISOString().slice(0, 10),
  ).filter((code) => code.isSchedulable);
  const organizationSnapshot = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    value?.date ?? new Date().toISOString().slice(0, 10),
  );
  const reportEmployees = organizationSnapshot.employees.map((employee) => ({
    ...employee,
    department: employee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : organizationSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
  }));
  return (
    <Dialog open={Boolean(value)} onClose={() => onChange(null)} fullWidth maxWidth="sm">
      <DialogTitle>근태 일정 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>직원</InputLabel>
            <Select
              value={String(value?.employeeId ?? '')}
              label="직원"
              onChange={(event) => value && onChange({
                ...value,
                employeeId: Number(event.target.value),
              })}
            >
              {reportEmployees.map((employee) => (
                <MenuItem key={employee.id} value={String(employee.id)}>
                  {employee.department} · {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>근태코드</InputLabel>
            <Select
              value={value?.codeId ?? ''}
              label="근태코드"
              onChange={(event) => value && onChange({
                ...value,
                codeId: event.target.value,
              })}
            >
              {attendanceCodes.map((code) => (
                <MenuItem key={code.id} value={code.id}>{code.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            type="date"
            label="일자"
            value={value?.date ?? ''}
            onChange={(event) => value && onChange({
              ...value,
              date: event.target.value,
            })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onChange(null)}>취소</Button>
        <Button variant="contained" onClick={onSave}>수정 저장</Button>
      </DialogActions>
    </Dialog>
  );
}
