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
  editTitle: '\uc9c1\uc6d0 \uc815\ubcf4 \uc218\uc815',
  addTitle: '\uc9c1\uc6d0 \ub4f1\ub85d',
  name: '\uc774\ub984',
  team: '\ubd80\uc11c/\ud300',
  position: '\uc9c1\uae09',
  workType: '\uadfc\ubb34\uc720\ud615',
  holdStatus: '\uc7ac\uc9c1\uc0c1\ud0dc',
  select: '\uc120\ud0dd',
  shiftWorker: '\uad50\ub300\uadfc\ubb34 \ub300\uc0c1\uc790',
  effectiveDate: '\ubcc0\uacbd \uc801\uc6a9\uc77c',
  hireDate: '\uc785\uc0ac\uc77c',
  cancel: '\ucde8\uc18c',
  save: '\uc800\uc7a5',
};

const today = () => new Date().toISOString().slice(0, 10);

const fallbackPositions = ['\uc0ac\uc6d0', '\uc8fc\uc784', '\ub300\ub9ac', '\uacfc\uc7a5', '\ucc28\uc7a5', '\ubd80\uc7a5'];
const fallbackHoldStatuses: EmployeeDialogOption[] = [
  { value: 'HOLD_ACTIVE', label: '\uc7ac\uc9c1' },
  { value: 'HOLD_LEAVE', label: '\ud734\uc9c1' },
  { value: 'HOLD_RETIRED', label: '\ud1f4\uc0ac' },
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
    : toOptions(fallbackPositions);
  const resolvedHoldStatusOptions = holdStatusOptions.length > 0
    ? holdStatusOptions
    : fallbackHoldStatuses;
  const defaultPosition = resolvedPositionOptions[0]?.value ?? '';
  const defaultHoldStatus = resolvedHoldStatusOptions[0]?.value ?? '';
  const [form, setForm] = useState<OrganizationEmployee>(
    () => employee ?? emptyEmployee(nextId, defaultTeamId, defaultPosition, defaultHoldStatus),
  );
  const [effectiveDate, setEffectiveDate] = useState(today);
  const dateValue = employee ? effectiveDate : form.startDate;

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
              onChange={(event) => setForm({ ...form, teamId: event.target.value, backendDeptCode: event.target.value })}
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
                value={form.position}
                onChange={(event) => setForm({ ...form, position: event.target.value, backendRankCode: event.target.value })}
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
                value={form.jobTitle}
                onChange={(event) => setForm({ ...form, jobTitle: event.target.value, backendWorkTypeCode: event.target.value })}
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
                onChange={(event) => setForm({ ...form, backendHoldStatusCode: event.target.value })}
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
          disabled={!form.name.trim() || !form.teamId}
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

