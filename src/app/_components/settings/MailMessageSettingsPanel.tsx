'use client';

import { useMemo, useState } from 'react';
import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import {
  useDeleteMailMessageMutation,
  useInsertMailMessageMutation,
  useMailMessagesQuery,
  useModifyMailMessageMutation,
} from '@/hooks/useMailMessageQueries';
import type { AttendanceCode, MailMessage } from '@/types/domain';

const TEXT = {
  title: '메일 메시지 설정',
  description: '근태확인 이메일 발송 시 근태코드별로 사용할 기본 메시지를 관리합니다.',
  addMessage: '메일 메시지 추가',
  attendCode: '근태명',
  mailMessage: '메일 메시지',
  mailMessageHelper: '줄바꿈은 메일 본문에 그대로 반영됩니다.',
  etc: '비고',
  regDate: '등록일',
  manage: '관리',
  add: '추가',
  update: '수정 저장',
  cancel: '취소',
  edit: '수정',
  delete: '삭제',
  loadError: '메일 메시지 정보를 불러오지 못했습니다.',
  saveError: '메일 메시지 저장 중 오류가 발생했습니다.',
  emptyCode: '근태명을 선택해 주세요.',
  emptyMessage: '메일 메시지를 입력해 주세요.',
};

const createEmptyMessage = (): MailMessage => ({
  id: '',
  attendCode: '',
  detailCode: '',
  message: '',
  etc: '',
  regDate: '',
});

const gridSx = {
  borderColor: '#e2e8f0',
  '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';

const getCodeOptionLabel = (code: AttendanceCode) => code.label;

export default function MailMessageSettingsPanel() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MailMessage>(createEmptyMessage);
  const [validationMessage, setValidationMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const attendanceCodesQuery = useAttendanceCodesQuery();
  const mailMessagesQuery = useMailMessagesQuery();
  const insertMutation = useInsertMailMessageMutation();
  const modifyMutation = useModifyMailMessageMutation();
  const deleteMutation = useDeleteMailMessageMutation();

  const attendanceCodes = useMemo(() => {
    const activeCodes = attendanceCodesQuery.data?.filter((code) => code.isActive) ?? [];
    const statusCodes = activeCodes.filter((code) => code.groupCode === 'G_ATTE_STATUS');

    return (statusCodes.length > 0 ? statusCodes : activeCodes)
      .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) || a.id.localeCompare(b.id));
  }, [attendanceCodesQuery.data]);
  const codeLabelMap = useMemo(
    () => new Map(attendanceCodes.map((code) => [code.id, code.label])),
    [attendanceCodes],
  );
  const rows = mailMessagesQuery.data ?? [];
  const isSaving = insertMutation.isPending || modifyMutation.isPending;
  const hasLoadError = mailMessagesQuery.isError || attendanceCodesQuery.isError;
  const hasMutationError = insertMutation.isError || modifyMutation.isError || deleteMutation.isError;
  const mutationErrorMessage =
    getErrorMessage(insertMutation.error)
    || getErrorMessage(modifyMutation.error)
    || getErrorMessage(deleteMutation.error)
    || TEXT.saveError;

  const closeDialog = () => {
    setEditingId(null);
    setForm(createEmptyMessage());
    setValidationMessage('');
    setDialogOpen(false);
  };

  const openAddDialog = () => {
    setEditingId(null);
    setForm(createEmptyMessage());
    setValidationMessage('');
    setDialogOpen(true);
  };

  const handleEdit = (message: MailMessage) => {
    setEditingId(message.id);
    setForm({ ...message });
    setValidationMessage('');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.attendCode) {
      setValidationMessage(TEXT.emptyCode);
      return;
    }

    if (!form.message.trim()) {
      setValidationMessage(TEXT.emptyMessage);
      return;
    }

    const nextMessage = {
      ...form,
      id: editingId ?? form.id,
      detailCode: form.attendCode,
      message: form.message.trim(),
      etc: form.etc?.trim() ?? '',
    };
    const mutation = editingId ? modifyMutation : insertMutation;

    mutation.mutate(nextMessage, { onSuccess: closeDialog });
  };

  const columns: GridColDef<MailMessage>[] = [
    {
      field: 'attendCode',
      headerName: TEXT.attendCode,
      minWidth: 180,
      flex: 0.8,
      renderCell: ({ row }) => (
        <span>{codeLabelMap.get(row.attendCode) ?? row.attendCode}</span>
      ),
    },
    {
      field: 'message',
      headerName: TEXT.mailMessage,
      minWidth: 320,
      flex: 1.8,
      renderCell: ({ row }) => (
        <div className="py-2 leading-5 whitespace-pre-line">
          {row.message}
        </div>
      ),
    },
    { field: 'etc', headerName: TEXT.etc, minWidth: 160, flex: 0.8 },
    { field: 'regDate', headerName: TEXT.regDate, minWidth: 160, flex: 0.8 },
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
            <IconButton size="small" color="error" onClick={() => deleteMutation.mutate(row.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <section className="mt-5 space-y-4">
      <Paper elevation={0} className="border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">{TEXT.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{TEXT.description}</p>
          </div>
          <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
            {TEXT.addMessage}
          </Button>
        </div>

        {hasLoadError && <Alert severity="warning" sx={{ mt: 2 }}>{TEXT.loadError}</Alert>}
        {hasMutationError && <Alert severity="error" sx={{ mt: 2 }}>{mutationErrorMessage}</Alert>}
      </Paper>

      <Paper elevation={0} className="border border-slate-200 bg-white p-5">
        <div className="h-[520px]">
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id || row.attendCode}
            loading={mailMessagesQuery.isLoading || attendanceCodesQuery.isLoading}
            getRowHeight={() => 'auto'}
            pageSizeOptions={[10, 20]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
            disableRowSelectionOnClick
            localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
            sx={gridSx}
          />
        </div>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? TEXT.edit : TEXT.addMessage}</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="mail-message-attend-code-label">{TEXT.attendCode}</InputLabel>
              <Select
                labelId="mail-message-attend-code-label"
                label={TEXT.attendCode}
                value={form.attendCode}
                onChange={(event) => setForm((prev) => ({
                  ...prev,
                  attendCode: event.target.value,
                  detailCode: event.target.value,
                }))}
              >
                {attendanceCodes.map((code) => (
                  <MenuItem key={code.id} value={code.id}>
                    {getCodeOptionLabel(code)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label={TEXT.mailMessage}
              helperText={TEXT.mailMessageHelper}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
            />
            <TextField
              fullWidth
              label={TEXT.etc}
              value={form.etc ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, etc: event.target.value }))}
            />
            {validationMessage && <Alert severity="warning">{validationMessage}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDialog}>{TEXT.cancel}</Button>
          <Button variant="contained" disabled={isSaving} onClick={handleSave}>
            {editingId ? TEXT.update : TEXT.add}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
