'use client';

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
import { useScheduleEntryDrafts } from '@/app/_components/management/operations/hooks/useScheduleEntryDrafts';
import type { OperationScheduleSaveResult } from '@/repositories/operationScheduleRepository';
import type { OperationSchedule } from '@/types/domain';
import ScheduleEntryPreview from './ScheduleEntryPreview';

type Props = {
  open: boolean;
  existing: OperationSchedule[];
  onClose: () => void;
  onSave: (
    items: OperationSchedule[],
  ) => void | OperationScheduleSaveResult | Promise<void | OperationScheduleSaveResult>;
};

export default function ScheduleEntryDialog({
  open,
  existing,
  onClose,
  onSave,
}: Props) {
  const entry = useScheduleEntryDrafts({ existing });

  const save = async () => {
    await onSave(entry.buildSchedules());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>근태일정 일괄 입력</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {entry.isLoading && (
            <Alert severity="info">
              부서, 직원, 근태코드 정보를 불러오는 중입니다.
            </Alert>
          )}
          {entry.isError && (
            <Alert severity="warning">
              부서, 직원 또는 근태코드 API를 불러오지 못했습니다.
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>부서</InputLabel>
            <Select
              value={entry.department}
              label="부서"
              onChange={(event) => entry.setDepartment(event.target.value)}
            >
              <MenuItem value="" disabled>
                부서를 선택하세요
              </MenuItem>
              {entry.departments.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">직원 선택</p>
              <Button size="small" onClick={entry.selectDepartmentEmployees}>
                현재 부서 전체 선택
              </Button>
            </div>
            <FormControl fullWidth>
              <InputLabel>{entry.department || '직원'}</InputLabel>
              <Select
                multiple
                value={entry.employeeIds.filter((id) =>
                  entry.departmentEmployees.some((item) => String(item.id) === id))}
                label={`${entry.department || '직원'}`}
                renderValue={(selected) => `${selected.length}명 선택`}
                onChange={(event) => {
                  const values = typeof event.target.value === 'string'
                    ? event.target.value.split(',')
                    : event.target.value;
                  entry.setDepartmentSelection(values);
                }}
              >
                {entry.departmentEmployees.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {entry.employeeIds.includes(String(item.id)) ? '✓ ' : ''}{item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <FormControl fullWidth>
            <InputLabel>근태코드</InputLabel>
            <Select
              value={entry.codeId}
              label="근태코드"
              onChange={(event) => entry.setCodeId(event.target.value)}
            >
              <MenuItem value="" disabled>
                근태코드를 선택하세요
              </MenuItem>
              {entry.attendanceCodes.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1}>
            <TextField
              fullWidth
              type="date"
              label="일자 추가"
              value={entry.dateDraft}
              onChange={(event) => entry.setDateDraft(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button variant="outlined" disabled={!entry.dateDraft} onClick={entry.addDate}>
              추가
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {entry.dates.map((date) => (
              <Chip
                key={date}
                label={date}
                onDelete={() => entry.removeDate(date)}
              />
            ))}
          </Stack>

          <ScheduleEntryPreview rows={entry.preview} codeLabel={entry.code?.label} />

          <Alert severity="info">총 {entry.preview.length}건이 입력됩니다.</Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={entry.isLoading || !entry.employeeIds.length || !entry.dates.length || !entry.codeId}
          onClick={save}
        >
          {entry.preview.length}건 일괄 저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
