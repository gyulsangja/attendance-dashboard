'use client';

import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
} from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import { getOrganizationSnapshot } from '@/store/slices/organizationSlice';

export type EditingTime = {
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
  canDelete: boolean;
  onChange: (value: EditingTime | null) => void;
  onSave: () => void;
  onDelete: () => void;
};

export default function TimeEditDialog({
  value,
  canDelete,
  onChange,
  onSave,
  onDelete,
}: Props) {
  const organization = useAppSelector((state) => state.organization);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const attendanceCodes = getAttendanceCodesAtDate(
    codeMaster.codes,
    codeMaster.history,
    value?.date ?? new Date().toISOString().slice(0, 10),
  );
  const employees = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    value?.date ?? new Date().toISOString().slice(0, 10),
  ).employees;

  return (
    <Dialog open={Boolean(value)} onClose={() => onChange(null)} fullWidth maxWidth="xs">
      <DialogTitle>출퇴근 시간 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="직원"
            value={employees.find((item) => item.id === value?.employeeId)?.name ?? ''}
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
            해당 날짜에 사용 가능한 전체 근태코드를 직접 추가하거나 해제할 수 있습니다.
          </Alert>
          <FormGroup>
            {attendanceCodes.map((code) => (
              <FormControlLabel
                key={code.id}
                label={code.label}
                control={(
                  <Checkbox
                    checked={value?.attendanceCodeIds.includes(code.id) ?? false}
                    onChange={(event) => {
                      if (!value) return;
                      onChange({
                        ...value,
                        attendanceCodeIds: event.target.checked
                          ? [...value.attendanceCodeIds, code.id]
                          : value.attendanceCodeIds.filter((item) => item !== code.id),
                      });
                    }}
                  />
                )}
              />
            ))}
          </FormGroup>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button color="error" disabled={!canDelete} onClick={onDelete}>
          출퇴근 기록 삭제
        </Button>
        <Stack direction="row" spacing={1}>
          <Button onClick={() => onChange(null)}>취소</Button>
          <Button variant="contained" onClick={onSave}>수정 저장</Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
