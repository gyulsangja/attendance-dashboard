'use client';

import { useMemo, useState } from 'react';
import { Add, Delete, Edit, Save } from '@mui/icons-material';
import {
  Alert,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import {
  useDeleteHolidayMutation,
  useHolidaysQuery,
  useInsertHolidayMutation,
  useModifyHolidayMutation,
} from '@/hooks/useHolidayQueries';
import type { Holiday } from '@/types/domain';

const TEXT = {
  title: '공휴일 설정',
  description: '연도별 공휴일을 조회하고 필요한 휴일을 추가, 수정, 삭제합니다.',
  year: '연도',
  date: '날짜',
  name: '공휴일명',
  etc: '비고',
  manage: '관리',
  add: '추가',
  update: '수정 저장',
  cancel: '취소',
  edit: '수정',
  delete: '삭제',
  loadError: '공휴일 API를 불러오지 못했습니다.',
  saveError: '공휴일 저장 중 오류가 발생했습니다.',
  emptyName: '공휴일명을 입력해 주세요.',
  emptyDate: '날짜를 선택해 주세요.',
};

const createEmptyHoliday = (year: number): Holiday => ({
  id: '',
  date: `${year}-01-01`,
  name: '',
  type: 'PUBLIC',
  isActive: true,
  etc: '',
});

const gridSx = {
  borderColor: '#e2e8f0',
  '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
};

export default function HolidaySettingsPanel() {
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 5 }, (_item, index) => currentYear - 2 + index),
    [currentYear],
  );
  const [year, setYear] = useState(currentYear);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Holiday>(() => createEmptyHoliday(currentYear));
  const [validationMessage, setValidationMessage] = useState('');

  const holidaysQuery = useHolidaysQuery(year);
  const insertHolidayMutation = useInsertHolidayMutation(year);
  const modifyHolidayMutation = useModifyHolidayMutation(year);
  const deleteHolidayMutation = useDeleteHolidayMutation(year);

  const holidays = holidaysQuery.data ?? [];
  const isSaving = insertHolidayMutation.isPending || modifyHolidayMutation.isPending;
  const hasMutationError = insertHolidayMutation.isError
    || modifyHolidayMutation.isError
    || deleteHolidayMutation.isError;

  const resetForm = () => {
    setEditingId(null);
    setForm(createEmptyHoliday(year));
    setValidationMessage('');
  };

  const handleYearChange = (nextYear: number) => {
    setYear(nextYear);
    setEditingId(null);
    setForm(createEmptyHoliday(nextYear));
    setValidationMessage('');
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingId(holiday.id);
    setForm({ ...holiday });
    setValidationMessage('');
  };

  const handleSave = () => {
    if (!form.date) {
      setValidationMessage(TEXT.emptyDate);
      return;
    }

    if (!form.name.trim()) {
      setValidationMessage(TEXT.emptyName);
      return;
    }

    const nextHoliday = {
      ...form,
      id: editingId ?? (form.id || form.date),
      name: form.name.trim(),
      etc: form.etc?.trim() ?? '',
    };

    const mutation = editingId ? modifyHolidayMutation : insertHolidayMutation;
    mutation.mutate(nextHoliday, { onSuccess: resetForm });
  };

  const columns: GridColDef<Holiday>[] = [
    { field: 'date', headerName: TEXT.date, minWidth: 130, flex: 0.8 },
    { field: 'name', headerName: TEXT.name, minWidth: 180, flex: 1.2 },
    { field: 'etc', headerName: TEXT.etc, minWidth: 180, flex: 1.2 },
    {
      field: 'actions',
      headerName: TEXT.manage,
      minWidth: 110,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <div className="flex h-full items-center justify-center gap-1">
          <Tooltip title={TEXT.edit}>
            <IconButton size="small" onClick={() => handleEdit(row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={TEXT.delete}>
            <IconButton size="small" color="error" onClick={() => deleteHolidayMutation.mutate(row.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <section className="mt-5 space-y-4">
      <Paper elevation={0} className="border border-slate-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">{TEXT.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{TEXT.description}</p>
          </div>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="holiday-year-label">{TEXT.year}</InputLabel>
            <Select
              labelId="holiday-year-label"
              label={TEXT.year}
              value={year}
              onChange={(event) => handleYearChange(Number(event.target.value))}
            >
              {yearOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3, alignItems: 'center' }}>
          <TextField
            size="small"
            type="date"
            label={TEXT.date}
            value={form.date}
            onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            size="small"
            label={TEXT.name}
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            sx={{ minWidth: 220 }}
          />
          <TextField
            size="small"
            label={TEXT.etc}
            value={form.etc ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, etc: event.target.value }))}
            sx={{ minWidth: 220 }}
          />
          <Button variant="contained" startIcon={editingId ? <Save /> : <Add />} onClick={handleSave} disabled={isSaving}>
            {editingId ? TEXT.update : TEXT.add}
          </Button>
          {editingId ? <Button onClick={resetForm}>{TEXT.cancel}</Button> : null}
        </Stack>

        {validationMessage && <Alert severity="warning" sx={{ mt: 2 }}>{validationMessage}</Alert>}
        {holidaysQuery.isError && <Alert severity="warning" sx={{ mt: 2 }}>{TEXT.loadError}</Alert>}
        {hasMutationError && <Alert severity="error" sx={{ mt: 2 }}>{TEXT.saveError}</Alert>}
      </Paper>

      <Paper elevation={0} className="border border-slate-200 p-5">
        <div className="h-[520px]">
          <DataGrid
            rows={holidays}
            columns={columns}
            loading={holidaysQuery.isLoading}
            pageSizeOptions={[10, 20]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            disableRowSelectionOnClick
            localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
            sx={gridSx}
          />
        </div>
      </Paper>
    </section>
  );
}
