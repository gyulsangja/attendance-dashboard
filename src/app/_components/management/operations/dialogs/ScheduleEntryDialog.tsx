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

  const close = () => {
    entry.reset();
    onClose();
  };

  const save = async () => {
    await onSave(entry.drafts);
    entry.reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md">
      <DialogTitle>근태일정 일괄 입력</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            직원, 근태코드, 날짜를 선택해 일정 묶음을 추가하세요. 여러 묶음을 추가한 뒤 한 번에 저장할 수 있습니다.
          </Alert>

          {entry.isLoading && (
            <Alert severity="info">
              부서, 직원, 근태코드 정보를 불러오는 중입니다.
            </Alert>
          )}
          {entry.isError && (
            <Alert severity="warning">
              부서, 직원 또는 근태코드를 불러오지 못했습니다.
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>소속 필터</InputLabel>
            <Select
              value={entry.department}
              label="소속 필터"
              onChange={(event) => entry.setDepartment(event.target.value)}
            >
              <MenuItem value="">전체 직원</MenuItem>
              {entry.departments.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-600">직원 선택</p>
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={entry.selectVisibleEmployees}>
                  현재 목록 전체 선택
                </Button>
                <Button size="small" onClick={entry.clearVisibleEmployees}>
                  현재 목록 선택 해제
                </Button>
              </Stack>
            </div>
            <FormControl fullWidth>
              <InputLabel>직원</InputLabel>
              <Select
                multiple
                value={entry.employeeIds.filter((id) =>
                  entry.visibleEmployees.some((item) => String(item.id) === id))}
                label="직원"
                renderValue={(selected) => selected.length + '명 선택'}
                onChange={(event) => {
                  const values = typeof event.target.value === 'string'
                    ? event.target.value.split(',')
                    : event.target.value;
                  entry.setVisibleSelection(values);
                }}
              >
                {entry.visibleEmployees.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {entry.employeeIds.includes(String(item.id)) ? '[선택] ' : ''}{item.department} / {item.name}
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

          <TextField
            fullWidth
            type="date"
            label="날짜"
            value={entry.dateDraft}
            onChange={(event) => entry.setDateDraft(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Button
            variant="outlined"
            disabled={!entry.employeeIds.length || !entry.dateDraft || !entry.codeId}
            onClick={entry.addDrafts}
          >
            선택 일정 추가
          </Button>

          <ScheduleEntryPreview rows={entry.drafts} onDelete={entry.removeDraft} />

          <Alert severity="info">총 {entry.drafts.length}건을 저장합니다.</Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>취소</Button>
        <Button
          variant="contained"
          disabled={entry.isLoading || entry.drafts.length === 0}
          onClick={save}
        >
          {entry.drafts.length}건 저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
