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
  company: '회사명',
  employeeNo: '사번',
  name: '이름',
  email: '이메일',
  phoneNo: '연락처',
  team: '부서/팀',
  position: '직급',
  workType: '근무유형',
  holdStatus: '재직상태',
  select: '선택',
  hireDate: '입사일',
  retireDate: '퇴사일',
  etc: '비고',
  cancel: '취소',
  save: '저장',
  missingOptions: '직원 등록에 필요한 공통코드 선택값이 없습니다. 부서/직급/근무유형/재직상태 코드를 먼저 등록해 주세요.',
  missingRetireDate: '퇴사 상태에서는 퇴사일을 입력해 주세요.',
};

const today = () => new Date().toISOString().slice(0, 10);
const DEFAULT_COMPANY_NAME = '(주)엘엑스';

const fallbackPositions = ['사원', '주임', '대리', '과장', '차장', '부장'];
const fallbackHoldStatuses: EmployeeDialogOption[] = [
  { value: 'HOLD_ACTIVE', label: '재직' },
  { value: 'HOLD_LEAVE', label: '휴직' },
  { value: 'HOLD_RETIRED', label: '퇴사' },
];

const toOptions = (values: string[]): EmployeeDialogOption[] =>
  values.map((value) => ({ value, label: value }));

const isRetiredStatus = (code = '', label = '') => {
  const normalizedCode = code.trim().toUpperCase();
  const normalizedLabel = label.trim();
  return normalizedCode === 'HOLD_RETIRED'
    || normalizedCode.includes('RETIRED')
    || normalizedLabel.includes('퇴사')
    || normalizedLabel.includes('퇴직');
};

const emptyEmployee = (
  id: number,
  teamId: string,
  defaults: {
    positionCode: string;
    positionName: string;
    workTypeCode: string;
    workTypeName: string;
    holdStatusCode: string;
    holdStatusName: string;
    teamName: string;
  },
): OrganizationEmployee => ({
  id,
  employeeNo: '',
  empCompany: DEFAULT_COMPANY_NAME,
  name: '',
  email: '',
  phoneNo: '',
  teamId,
  position: defaults.positionName,
  jobTitle: defaults.workTypeName,
  shiftWorker: false,
  startDate: today(),
  endDate: '',
  backendDeptCode: teamId,
  backendDeptName: defaults.teamName,
  backendRankCode: defaults.positionCode,
  backendRankName: defaults.positionName,
  backendWorkTypeCode: defaults.workTypeCode,
  backendWorkTypeName: defaults.workTypeName,
  backendHoldStatusCode: defaults.holdStatusCode,
  backendHoldStatusName: defaults.holdStatusName,
  etc: '',
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
  const defaultPositionName = resolvedPositionOptions[0]?.label ?? defaultPosition;
  const defaultWorkType = jobTitleOptions[0]?.value ?? '';
  const defaultWorkTypeName = jobTitleOptions[0]?.label ?? defaultWorkType;
  const defaultHoldStatus = resolvedHoldStatusOptions[0]?.value ?? '';
  const defaultHoldStatusName = resolvedHoldStatusOptions[0]?.label ?? defaultHoldStatus;
  const defaultTeamName = teams.find((team) => team.id === defaultTeamId)?.name ?? defaultTeamId;
  const [form, setForm] = useState<OrganizationEmployee>(
    () => employee ?? emptyEmployee(nextId, defaultTeamId, {
      positionCode: defaultPosition,
      positionName: defaultPositionName,
      workTypeCode: defaultWorkType,
      workTypeName: defaultWorkTypeName,
      holdStatusCode: defaultHoldStatus,
      holdStatusName: defaultHoldStatusName,
      teamName: defaultTeamName,
    }),
  );
  const [validationMessage, setValidationMessage] = useState('');
  const getOptionLabel = (options: EmployeeDialogOption[], value: string) =>
    options.find((option) => option.value === value)?.label ?? value;
  const retired = isRetiredStatus(
    form.backendHoldStatusCode ?? '',
    form.backendHoldStatusName ?? getOptionLabel(resolvedHoldStatusOptions, form.backendHoldStatusCode ?? ''),
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{employee ? TEXT.editTitle : TEXT.addTitle}</DialogTitle>
      <DialogContent sx={{ pt: '24px !important' }}>
        <Stack spacing={2.5}>
          {isApiDataSource && (
            teams.length === 0 ||
            resolvedPositionOptions.length === 0 ||
            jobTitleOptions.length === 0 ||
            resolvedHoldStatusOptions.length === 0
          ) && (
            <Alert severity="warning">{TEXT.missingOptions}</Alert>
          )}

          <TextField
            fullWidth
            label={TEXT.name}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              fullWidth
              label={TEXT.company}
              value={form.empCompany ?? ''}
              onChange={(event) => setForm({ ...form, empCompany: event.target.value })}
            />
            <TextField
              fullWidth
              label={TEXT.employeeNo}
              value={form.employeeNo ?? ''}
              disabled={Boolean(employee)}
              onChange={(event) => setForm({
                ...form,
                employeeNo: event.target.value,
              })}
            />
          </div>

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
                  const isShiftWorker = value.toUpperCase() === 'WORK_SHIFT';
                  setForm({
                    ...form,
                    jobTitle: getOptionLabel(jobTitleOptions, value),
                    backendWorkTypeCode: value,
                    backendWorkTypeName: getOptionLabel(jobTitleOptions, value),
                    shiftWorker: isShiftWorker,
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
                  const label = getOptionLabel(resolvedHoldStatusOptions, value);
                  const nextRetired = isRetiredStatus(value, label);
                  setForm({
                    ...form,
                    backendHoldStatusCode: value,
                    backendHoldStatusName: label,
                    endDate: nextRetired ? form.endDate : '',
                  });
                }}
              >
                {resolvedHoldStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              fullWidth
              type="email"
              label={TEXT.email}
              value={form.email ?? ''}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
            <TextField
              fullWidth
              label={TEXT.phoneNo}
              value={form.phoneNo ?? ''}
              onChange={(event) => setForm({ ...form, phoneNo: event.target.value })}
            />
          </div>

          <TextField
            fullWidth
            type="date"
            label={TEXT.hireDate}
            value={form.startDate}
            onChange={(event) => setForm({ ...form, startDate: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            type="date"
            label={TEXT.retireDate}
            value={retired ? form.endDate ?? '' : ''}
            disabled={!retired}
            onChange={(event) => setForm({ ...form, endDate: event.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            fullWidth
            multiline
            minRows={2}
            label={TEXT.etc}
            value={form.etc ?? ''}
            onChange={(event) => setForm({ ...form, etc: event.target.value })}
          />
          {validationMessage && <Alert severity="warning">{validationMessage}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>{TEXT.cancel}</Button>
        <Button
          variant="contained"
          disabled={
            !form.name.trim()
            || (isApiDataSource && !form.employeeNo?.trim())
            || (isApiDataSource && !form.empCompany?.trim())
            || !form.teamId
            || (isApiDataSource && (
              !form.backendRankCode ||
              !form.backendWorkTypeCode ||
              !form.backendHoldStatusCode
            ))
          }
          onClick={() => {
            if (retired && !form.endDate) {
              setValidationMessage(TEXT.missingRetireDate);
              return;
            }

            setValidationMessage('');
            onSave({
              ...form,
              employeeNo: form.employeeNo?.trim() ?? '',
              empCompany: form.empCompany?.trim() ?? '',
              name: form.name.trim(),
              email: form.email?.trim() ?? '',
              phoneNo: form.phoneNo?.trim() ?? '',
              jobTitle: form.jobTitle.trim(),
              endDate: retired ? form.endDate : '',
              etc: form.etc?.trim() ?? '',
            }, form.startDate);
          }}
        >
          {TEXT.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

