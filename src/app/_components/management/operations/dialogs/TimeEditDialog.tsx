'use client';

import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import type { OperationSchedule } from '@/types/domain';

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
  schedules: OperationSchedule[];
};

type Props = {
  value: EditingTime | null;
  onChange: (value: EditingTime | null) => void;
  onSave: () => void;
  onAddSchedule: (codeId: string) => Promise<void>;
  onModifySchedule: (schedule: OperationSchedule) => Promise<void>;
  onDeleteSchedule: (schedule: OperationSchedule) => Promise<void>;
  saving?: boolean;
  error?: boolean;
};

const getCodeLabel = (
  codes: Array<{ id: string; label: string }>,
  codeId: string,
  fallback?: string,
) => codes.find((code) => code.id === codeId)?.label ?? fallback ?? codeId;

const fieldSx = {
  mt: 0.5,
};

export default function TimeEditDialog({
  value,
  onChange,
  onSave,
  onAddSchedule,
  onModifySchedule,
  onDeleteSchedule,
  saving = false,
  error = false,
}: Props) {
  const [newScheduleCodeId, setNewScheduleCodeId] = useState('');
  const [pendingScheduleCodeIds, setPendingScheduleCodeIds] = useState<Record<number, string>>({});
  const organization = useAppSelector((state) => state.organization);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const date = value?.date ?? new Date().toISOString().slice(0, 10);
  const allCodes = isApiDataSource
    ? apiAttendanceCodesQuery.data ?? []
    : getAttendanceCodesAtDate(
      codeMaster.codes,
      codeMaster.history,
      date,
    );
  const statusCodes = allCodes.filter((code) =>
    code.isActive && (!isApiDataSource || code.groupCode === 'G_ATTE_STATUS'));
  const scheduleCodes = allCodes.filter((code) =>
    code.isActive && (!isApiDataSource || code.groupCode === 'G_ATTE_CODE'));
  const employees = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    date,
  ).employees;

  const addSchedule = async () => {
    if (!newScheduleCodeId) return;
    await onAddSchedule(newScheduleCodeId);
    setNewScheduleCodeId('');
  };

  const applyScheduleChange = async (schedule: OperationSchedule) => {
    const codeId = pendingScheduleCodeIds[schedule.id] ?? schedule.codeId;
    if (!codeId || codeId === schedule.codeId) return;

    const label = getCodeLabel(scheduleCodes, codeId, schedule.type);
    await onModifySchedule({
      ...schedule,
      codeId,
      type: label,
      detail: label,
    });
    setPendingScheduleCodeIds((current) => {
      const next = { ...current };
      delete next[schedule.id];
      return next;
    });
  };

  return (
    <Dialog open={Boolean(value)} onClose={() => onChange(null)} fullWidth maxWidth="sm">
      <DialogTitle>{value?.recordId ? '출입통제 및 근태 수정' : '출입통제 데이터 입력'}</DialogTitle>
      <DialogContent sx={{ pt: '12px !important' }}>
        <Stack spacing={2.5}>
          {error && <Alert severity="error">{'저장 중 오류가 발생했습니다.'}</Alert>}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={'직원'}
              value={
                value?.employeeName
                ?? employees.find((item) => item.id === value?.employeeId)?.name
                ?? ''
              }
              disabled
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label={'일자'}
              value={value?.date ?? ''}
              disabled
              fullWidth
              sx={fieldSx}
            />
          </Stack>

          <Stack spacing={2}>
            <p className="text-sm font-bold text-slate-700">{'출입통제 근태상태'}</p>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                type="time"
                label={'출근시간'}
                value={value?.checkIn ?? ''}
                onChange={(event) => value && onChange({
                  ...value,
                  checkIn: event.target.value,
                })}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                type="time"
                label={'퇴근시간'}
                value={value?.checkOut ?? ''}
                onChange={(event) => value && onChange({
                  ...value,
                  checkOut: event.target.value,
                })}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
                sx={fieldSx}
              />
            </Stack>

            <FormControl fullWidth sx={fieldSx}>
              <InputLabel id="attendance-result-label">{'근태상태'}</InputLabel>
              <Select
                labelId="attendance-result-label"
                label={'근태상태'}
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
                <MenuItem value="">{'선택 없음'}</MenuItem>
                {statusCodes.map((code) => (
                  <MenuItem key={code.id} value={code.id}>
                    {code.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="flex justify-end">
              <Button variant="contained" onClick={onSave} disabled={saving}>
                {value?.recordId ? '출입통제 정보 수정' : '출입통제 정보 입력'}
              </Button>
            </div>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <p className="text-sm font-bold text-slate-700">{'직원별 근태정보'}</p>

            {value?.schedules.length ? (
              value.schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center"
                >
                  <FormControl fullWidth sx={fieldSx}>
                    <InputLabel id={`schedule-code-${schedule.id}`}>{'근태'}</InputLabel>
                    <Select
                      labelId={`schedule-code-${schedule.id}`}
                      label={'근태'}
                      value={pendingScheduleCodeIds[schedule.id] ?? schedule.codeId}
                      onChange={(event) => {
                        const codeId = event.target.value;
                        setPendingScheduleCodeIds((current) => ({
                          ...current,
                          [schedule.id]: codeId,
                        }));
                      }}
                    >
                      {scheduleCodes.map((code) => (
                        <MenuItem key={code.id} value={code.id}>
                          {code.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    disabled={saving || (pendingScheduleCodeIds[schedule.id] ?? schedule.codeId) === schedule.codeId}
                    onClick={() => { void applyScheduleChange(schedule); }}
                    sx={{ minWidth: 72, bgcolor: '#0f172a' }}
                  >
                    {'적용'}
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    disabled={saving}
                    onClick={() => { void onDeleteSchedule(schedule); }}
                    sx={{ minWidth: 72 }}
                  >
                    {'삭제'}
                  </Button>
                </div>
              ))
            ) : (
              <Alert severity="info">
                {'직원별로 추가된 근태정보가 없습니다. 필요한 근태정보를 아래에서 추가할 수 있습니다.'}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <FormControl fullWidth sx={fieldSx}>
                <InputLabel id="new-schedule-code">{'추가할 근태'}</InputLabel>
                <Select
                  labelId="new-schedule-code"
                  label={'추가할 근태'}
                  value={newScheduleCodeId}
                  onChange={(event) => setNewScheduleCodeId(event.target.value)}
                >
                  <MenuItem value="">{'선택'}</MenuItem>
                  {scheduleCodes.map((code) => (
                    <MenuItem key={code.id} value={code.id}>
                      {code.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => { void addSchedule(); }}
                disabled={saving || !newScheduleCodeId}
                sx={{ minWidth: 96 }}
              >
                {'추가'}
              </Button>
            </Stack>
          </Stack>

          {isApiDataSource && apiAttendanceCodesQuery.isLoading && (
            <Alert severity="info">{'근태코드를 불러오는 중입니다.'}</Alert>
          )}
          {isApiDataSource && apiAttendanceCodesQuery.isError && (
            <Alert severity="warning">{'근태코드를 불러오지 못했습니다.'}</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onChange(null)} disabled={saving}>{'닫기'}</Button>
      </DialogActions>
    </Dialog>
  );
}
