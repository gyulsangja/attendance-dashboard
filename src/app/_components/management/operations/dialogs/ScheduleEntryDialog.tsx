'use client';

import { useState } from 'react';
import {
  Alert,
  Button,
  Chip,
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
import {
  type OperationSchedule,
} from '@/mocks';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';

type Props = {
  open: boolean;
  existing: OperationSchedule[];
  onClose: () => void;
  onSave: (items: OperationSchedule[]) => void;
};

export default function ScheduleEntryDialog({
  open,
  existing,
  onClose,
  onSave,
}: Props) {
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const [department, setDepartment] = useState('개발팀');
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [codeId, setCodeId] = useState('');
  const [dates, setDates] = useState<string[]>(['2026-06-08']);
  const [dateDraft, setDateDraft] = useState('2026-06-09');
  const attendanceCodes = getAttendanceCodesAtDate(
    codeMaster.codes,
    codeMaster.history,
    dates[0] ?? dateDraft,
  ).filter((code) => code.isSchedulable);
  const organizationSnapshot = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    dates[0] ?? dateDraft,
  );
  const reportEmployees = organizationSnapshot.employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    position: employee.position,
    department: employee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : organizationSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
  }));

  const departments = [...new Set(reportEmployees.map((item) => item.department))];
  const departmentEmployees = reportEmployees.filter(
    (item) => item.department === department,
  );
  const selectedEmployees = reportEmployees.filter((item) =>
    employeeIds.includes(String(item.id)),
  );
  const code = attendanceCodes.find((item) => item.id === codeId);
  const preview = selectedEmployees.flatMap((employee) =>
    dates.map((date) => ({ employee, date })),
  );

  const save = () => {
    if (!code) return;
    let nextId = Math.max(0, ...existing.map((item) => item.id)) + 1;
    const additions = selectedEmployees.flatMap((employee) =>
      dates
        .filter(
          (date) =>
            !existing.some(
              (item) =>
                item.employeeId === employee.id
                && item.date === date
                && item.codeId === code.id,
            ),
        )
        .map((date) => ({
          id: nextId++,
          date,
          department: employee.department,
          employeeId: employee.id,
          name: employee.name,
          codeId: code.id,
          type: code.label,
          detail: `${code.label} 입력`,
        })),
    );
    onSave(additions);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>근태 일정 일괄 입력</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>부서</InputLabel>
            <Select
              value={department}
              label="부서"
              onChange={(event) => setDepartment(event.target.value)}
            >
              {departments.map((item) => (
                <MenuItem key={item} value={item}>{item}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">직원 선택</p>
              <Button
                size="small"
                onClick={() => setEmployeeIds((current) => [
                  ...new Set([
                    ...current,
                    ...departmentEmployees.map((item) => String(item.id)),
                  ]),
                ])}
              >
                현재 부서 전체 선택
              </Button>
            </div>
            <FormControl fullWidth>
              <InputLabel>{department} 직원</InputLabel>
              <Select
                multiple
                value={employeeIds.filter((id) =>
                  departmentEmployees.some((item) => String(item.id) === id),
                )}
                label={`${department} 직원`}
                renderValue={(selected) => `${selected.length}명 선택`}
                onChange={(event) => {
                  const values = typeof event.target.value === 'string'
                    ? event.target.value.split(',')
                    : event.target.value;
                  const others = employeeIds.filter(
                    (id) => !departmentEmployees.some((item) => String(item.id) === id),
                  );
                  setEmployeeIds([...others, ...values]);
                }}
              >
                {departmentEmployees.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {employeeIds.includes(String(item.id)) ? '✓ ' : ''}{item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <FormControl fullWidth>
            <InputLabel>근태코드</InputLabel>
            <Select
              value={codeId}
              label="근태코드"
              onChange={(event) => setCodeId(event.target.value)}
            >
              {attendanceCodes.map((item) => (
                <MenuItem key={item.id} value={item.id}>{item.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              type="date"
              label="일자 추가"
              value={dateDraft}
              onChange={(event) => setDateDraft(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              variant="outlined"
              onClick={() => setDates((current) =>
                current.includes(dateDraft) ? current : [...current, dateDraft].sort()
              )}
            >
              추가
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {dates.map((date) => (
              <Chip
                key={date}
                label={date}
                onDelete={() => setDates((current) =>
                  current.filter((item) => item !== date)
                )}
              />
            ))}
          </Stack>

          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
            {preview.length ? preview.map(({ employee, date }) => (
              <div
                key={`${employee.id}-${date}`}
                className="grid grid-cols-[1fr_1fr_120px] border-b px-3 py-2 text-sm"
              >
                <strong>{employee.name}</strong>
                <span>{code?.label ?? '근태 미선택'}</span>
                <span className="text-right text-slate-500">{date}</span>
              </div>
            )) : (
              <p className="p-4 text-center text-sm text-slate-400">
                직원과 날짜를 선택해주세요.
              </p>
            )}
          </div>

          <Alert severity="info">총 {preview.length}건이 입력됩니다.</Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={!employeeIds.length || !dates.length || !codeId}
          onClick={save}
        >
          {preview.length}건 일괄 저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
