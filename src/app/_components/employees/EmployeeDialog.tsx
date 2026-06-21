'use client';

import { useEffect, useState } from 'react';
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
import type { OrganizationEmployee, OrganizationTeam } from '@/store/slices/organizationSlice';
import { UNASSIGNED_TEAM_ID, UNASSIGNED_TEAM_NAME } from '@/store/slices/organizationSlice';

type EmployeeDialogProps = {
  open: boolean;
  employee: OrganizationEmployee | null;
  teams: OrganizationTeam[];
  defaultTeamId: string;
  nextId: number;
  onClose: () => void;
  onSave: (employee: OrganizationEmployee, effectiveDate: string) => void;
};

const emptyEmployee = (id: number, teamId: string): OrganizationEmployee => ({
  id,
  name: '',
  teamId,
  position: '사원',
  jobTitle: '',
  shiftWorker: false,
  startDate: new Date().toISOString().slice(0, 10),
});

export default function EmployeeDialog({
  open,
  employee,
  teams,
  defaultTeamId,
  nextId,
  onClose,
  onSave,
}: EmployeeDialogProps) {
  const [form, setForm] = useState<OrganizationEmployee>(
    emptyEmployee(nextId, defaultTeamId),
  );
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  useEffect(() => {
    if (!open) return;
    setForm(employee ?? emptyEmployee(nextId, defaultTeamId));
    setEffectiveDate(new Date().toISOString().slice(0, 10));
  }, [open, employee, nextId, defaultTeamId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{employee ? '직원 정보 수정' : '직원 등록'}</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Stack spacing={2.5}>
          <TextField
            fullWidth
            label="이름"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />

          <FormControl fullWidth>
            <InputLabel>부서</InputLabel>
            <Select
              label="부서"
              value={form.teamId}
              onChange={(event) => {
                const teamId = event.target.value;
                setForm({
                  ...form,
                  teamId,
                });
              }}
          >
              <MenuItem value={UNASSIGNED_TEAM_ID}>
                {UNASSIGNED_TEAM_NAME}
              </MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormControl fullWidth>
              <InputLabel>직위</InputLabel>
              <Select
                label="직위"
                value={form.position}
                onChange={(event) => setForm({ ...form, position: event.target.value })}
              >
                {['사원', '대리', '과장', '차장', '부장', '임원'].map((position) => (
                  <MenuItem key={position} value={position}>{position}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="직무"
              placeholder="예: 기술지원"
              value={form.jobTitle}
              onChange={(event) => setForm({ ...form, jobTitle: event.target.value })}
            />
          </div>

          <FormControlLabel
            sx={{ mx: 0 }}
            control={(
              <Switch
                checked={form.shiftWorker}
                onChange={(event) => setForm({ ...form, shiftWorker: event.target.checked })}
              />
            )}
            label="교대근무 대상자"
          />

          <TextField
            fullWidth
            type="date"
            label={employee ? '변경 적용일' : '입사일'}
            value={employee ? effectiveDate : form.startDate}
            onChange={(event) => {
              if (employee) setEffectiveDate(event.target.value);
              else setForm({ ...form, startDate: event.target.value });
            }}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={!form.name.trim() || !form.jobTitle.trim() || !form.teamId}
          onClick={() => onSave(
            {
              ...form,
              name: form.name.trim(),
              jobTitle: form.jobTitle.trim(),
            },
            employee ? effectiveDate : form.startDate,
          )}
        >
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
