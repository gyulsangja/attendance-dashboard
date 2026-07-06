'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import {
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
  type OrganizationEmployee,
  type OrganizationTeam,
} from '@/store/slices/organizationSlice';
import { isApiDataSource } from '@/repositories/config';

export type EmployeeDialogOption = {
  value: string;
  label: string;
};

type EmployeeDialogProps = {
  open: boolean;
  employee: OrganizationEmployee | null;
  teams: OrganizationTeam[];
  defaultTeamId: string;
  nextId: number;
  positionOptions?: EmployeeDialogOption[];
  jobTitleOptions?: EmployeeDialogOption[];
  holdStatusOptions?: EmployeeDialogOption[];
  onClose: () => void;
  onSave: (employee: OrganizationEmployee, effectiveDate: string) => void;
};

const TEXT = {
  editTitle: '직원 정보 수정',
  addTitle: '직원 등록',
  name: '이름',
  team: '부서/팀',
  position: '직급',
  workType: '근무유형',
  holdStatus: '재직상태',
  select: '선택',
  shiftWorker: '교대근무 대상자',
  effectiveDate: '변경 적용일',
  hireDate: '입사일',
  cancel: '취소',
  save: '저장',
};

const today = () => new Date().toISOString().slice(0, 10);

const fallbackPositions = ['사원', '주임', '대리', '과장', '차장', '부장'];
const fallbackHoldStatuses: EmployeeDialogOption[] = [
  { value: 'HOLD_ACTIVE', label: '재직' },
  { value: 'HOLD_LEAVE', label: '휴직' },
  { value: 'HOLD_RETIRED', label: '퇴사' },
];

const toOptions = (values: string[]): EmployeeDialogOption[] =>
  values.map((value) => ({ value, label: value }));

const emptyEmployee = (
  id: number,
  teamId: string,
  defaultPosition: string,
  defaultHoldStatus: string,
): OrganizationEmployee => ({
  id,
  name: '',
  teamId,
  position: defaultPosition,
  jobTitle: '',
  shiftWorker: false,
  startDate: today(),
  backendHoldStatusCode: defaultHoldStatus,
});

export default function EmployeeDialog({
  open,
  employee,
  teams,
  defaultTeamId,
  nextId,
  positionOptions = [],
  jobTitleOptions = [],
  holdStatusOptions = [],
  onClose,
  onSave,
}: EmployeeDialogProps) {
  return (
    <EmployeeDialogContent
      key={`${employee?.id ?? 'new'}-${nextId}-${defaultTeamId}-${positionOptions.map((item) => item.value).join('|')}-${jobTitleOptions.map((item) => item.value).join('|')}-${holdStatusOptions.map((item) => item.value).join('|')}-${open}`}
      open={open}
      employee={employee}
      teams={teams}
      defaultTeamId={defaultTeamId}
      nextId={nextId}
      positionOptions={positionOptions}
      jobTitleOptions={jobTitleOptions}
      holdStatusOptions={holdStatusOptions}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

function EmployeeDialogContent({
  open,
  employee,
  teams,
  defaultTeamId,
  nextId,
  positionOptions = [],
  jobTitleOptions = [],
  holdStatusOptions = [],
  onClose,
  onSave,
}: EmployeeDialogProps) {
  const resolvedPositionOptions = positionOptions.length > 0
    ? positionOptions
    : isApiDataSource ? [] : toOptions(fallbackPositions);
  const resolvedHoldStatusOptions = holdStatusOptions.length > 0
    ? holdStatusOptions
    : isApiDataSource ? [] : fallbackHoldStatuses;
  const defaultPosition = resolvedPositionOptions[0]?.value ?? '';
  const defaultHoldStatus = resolvedHoldStatusOptions[0]?.value ?? '';
  const [form, setForm] = useState<OrganizationEmployee>(
    () => employee ?? emptyEmployee(nextId, defaultTeamId, defaultPosition, defaultHoldStatus),
  );
  const [effectiveDate, setEffectiveDate] = useState(today);
  const dateValue = employee ? effectiveDate : form.startDate;
  const getOptionLabel = (options: EmployeeDialogOption[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{employee ? TEXT.editTitle : TEXT.addTitle}</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label={TEXT.name}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>{TEXT.team}</InputLabel>
              <Select
                label={TEXT.team}
                value={form.teamId}
                onChange={(event) => {
                  const value = event.target.value;
                  const teamName = teams.find((team) => team.id === value)?.name ?? value;
                  setForm({
                    ...form,
                    teamId: value,
                    backendDeptCode: value,
                    backendDeptName: teamName,
                  });
                }}
              >
              <MenuItem value={UNASSIGNED_TEAM_ID}>{UNASSIGNED_TEAM_NAME}</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormControl fullWidth>
              <InputLabel>{TEXT.position}</InputLabel>
              <Select
                label={TEXT.position}
                value={form.backendRankCode ?? form.position}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm({
                    ...form,
                    position: getOptionLabel(resolvedPositionOptions, value),
                    backendRankCode: value,
                    backendRankName: getOptionLabel(resolvedPositionOptions, value),
                  });
                }}
              >
                {resolvedPositionOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{TEXT.workType}</InputLabel>
              <Select
                label={TEXT.workType}
                value={form.backendWorkTypeCode ?? form.jobTitle}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm({
                    ...form,
                    jobTitle: getOptionLabel(jobTitleOptions, value),
                    backendWorkTypeCode: value,
                    backendWorkTypeName: getOptionLabel(jobTitleOptions, value),
                  });
                }}
              >
                <MenuItem value="">{TEXT.select}</MenuItem>
                {jobTitleOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>{TEXT.holdStatus}</InputLabel>
              <Select
                label={TEXT.holdStatus}
                value={form.backendHoldStatusCode ?? defaultHoldStatus}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm({
                    ...form,
                    backendHoldStatusCode: value,
                    backendHoldStatusName: getOptionLabel(resolvedHoldStatusOptions, value),
                  });
                }}
              >
                {resolvedHoldStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <FormControlLabel
            sx={{ mx: 0 }}
            control={(
              <Switch
                checked={form.shiftWorker}
                onChange={(event) => setForm({ ...form, shiftWorker: event.target.checked })}
              />
            )}
            label={TEXT.shiftWorker}
          />

          <TextField
            fullWidth
            type="date"
            label={employee ? TEXT.effectiveDate : TEXT.hireDate}
            value={dateValue}
            onChange={(event) => {
              if (employee) setEffectiveDate(event.target.value);
              else setForm({ ...form, startDate: event.target.value });
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>{TEXT.cancel}</Button>
        <Button
          variant="contained"
          disabled={
            !form.name.trim()
            || !form.teamId
            || (isApiDataSource && (!form.backendRankCode || !form.backendHoldStatusCode))
          }
          onClick={() => onSave(
            {
              ...form,
              name: form.name.trim(),
              jobTitle: form.jobTitle.trim(),
            },
            dateValue,
          )}
        >
          {TEXT.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

