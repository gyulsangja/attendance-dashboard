'use client';

import { useMemo, useState, type SyntheticEvent } from 'react';
import { Add, Delete, Edit } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { CommonCode } from '@/adapters/commonCodeAdapter';
import {
  useCommonCodesQuery,
  useDeleteCommonCodeMutation,
  useInsertCommonCodeMutation,
  useModifyCommonCodeMutation,
} from '@/hooks/useCommonCodeQueries';

const TEXT = {
  title: '직원정보 항목 관리',
  error: '항목 저장 중 오류가 발생했습니다.',
  addItem: '항목 추가',
  active: '사용',
  inactive: '미사용',
  code: '관리코드',
  memo: '비고',
  memoPlaceholder: '관리 참고용 메모를 입력합니다.',
  insert: '추가',
  modify: '수정 저장',
  edit: '수정',
  delete: '삭제',
  cancel: '취소',
  status: '상태',
  manage: '관리',
  empty: '등록된 항목이 없습니다.',
  confirmDelete: '선택한 항목을 삭제하시겠습니까?',
};

const categories = [
  {
    groupCode: 'G_RANK_CODE',
    tabLabel: '직급',
    title: '직급',
    fieldLabel: '직급명',
    fieldPlaceholder: '예: 사원, 주임, 대리',
    codePrefix: 'RANK',
    codeSeparator: '',
  },
  {
    groupCode: 'G_WORK_TYPE',
    tabLabel: '근무유형',
    title: '근무유형',
    fieldLabel: '근무유형명',
    fieldPlaceholder: '예: 일반근무, 교대근무',
    codePrefix: 'WORK',
    codeSeparator: '_',
  },
  {
    groupCode: 'G_HOLD_STATUS',
    tabLabel: '재직상태',
    title: '재직상태',
    fieldLabel: '재직상태명',
    fieldPlaceholder: '예: 재직, 휴직, 퇴사',
    codePrefix: 'HOLD',
    codeSeparator: '_',
  },
] as const;

const emptyForm = (groupCode: string = categories[0].groupCode): CommonCode => ({
  groupCode,
  detailCode: '',
  label: '',
  sortOrder: 0,
  isActive: true,
  refVal1: '',
  refVal2: '',
  etc: '',
});

const createNextCode = (prefix: string, separator: string, rows: CommonCode[]) => {
  const maxNumber = rows.reduce((max, row) => {
    const match = row.detailCode.match(new RegExp(`^${prefix}_?(\\d+)$`));
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `${prefix}${separator}${String(maxNumber + 1).padStart(2, '0')}`;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';

export default function EmployeeInfoOptionPanel() {
  const codesQuery = useCommonCodesQuery();
  const insertMutation = useInsertCommonCodeMutation();
  const modifyMutation = useModifyCommonCodeMutation();
  const deleteMutation = useDeleteCommonCodeMutation();

  const codes = useMemo(() => codesQuery.data ?? [], [codesQuery.data]);
  const [tab, setTab] = useState(0);
  const category = categories[tab];
  const [editingDetailCode, setEditingDetailCode] = useState<string | null>(null);
  const [form, setForm] = useState<CommonCode>(() => emptyForm(category.groupCode));
  const [dialogOpen, setDialogOpen] = useState(false);

  const rows = useMemo(
    () => codes
      .filter((code) => code.groupCode === category.groupCode)
      .sort((a, b) => a.label.localeCompare(b.label, 'ko') || a.detailCode.localeCompare(b.detailCode)),
    [codes, category.groupCode],
  );

  const nextDetailCode = useMemo(
    () => createNextCode(category.codePrefix, category.codeSeparator, rows),
    [category.codePrefix, category.codeSeparator, rows],
  );
  const displayDetailCode = (editingDetailCode ?? form.detailCode) || nextDetailCode;

  const closeDialog = () => {
    setEditingDetailCode(null);
    setForm(emptyForm(category.groupCode));
    setDialogOpen(false);
  };

  const openAddDialog = () => {
    setEditingDetailCode(null);
    setForm({
      ...emptyForm(category.groupCode),
      detailCode: nextDetailCode,
    });
    setDialogOpen(true);
  };

  const changeTab = (_event: SyntheticEvent, nextTab: number) => {
    setTab(nextTab);
    setEditingDetailCode(null);
    setForm(emptyForm(categories[nextTab].groupCode));
    setDialogOpen(false);
  };

  const selectCode = (code: CommonCode) => {
    setEditingDetailCode(code.detailCode);
    setForm({ ...code, sortOrder: 0 });
    setDialogOpen(true);
  };

  const saveCode = () => {
    const isEditing = Boolean(editingDetailCode);
    const payload = {
      ...form,
      groupCode: category.groupCode,
      detailCode: (editingDetailCode ?? form.detailCode.trim().toUpperCase()) || nextDetailCode,
      label: form.label.trim(),
      sortOrder: 0,
      refVal1: form.refVal1.trim(),
      refVal2: form.refVal2.trim(),
      etc: form.etc.trim(),
    };

    const mutation = isEditing ? modifyMutation : insertMutation;
    mutation.mutate(payload, { onSuccess: closeDialog });
  };

  const deleteCode = (detailCode: string) => {
    if (!window.confirm(TEXT.confirmDelete)) return;
    deleteMutation.mutate(detailCode, { onSuccess: closeDialog });
  };

  const isSaving = insertMutation.isPending || modifyMutation.isPending || deleteMutation.isPending;
  const errorMessage =
    getErrorMessage(insertMutation.error)
    || getErrorMessage(modifyMutation.error)
    || getErrorMessage(deleteMutation.error);
  const hasError = codesQuery.isError || Boolean(errorMessage);

  return (
    <section className="mt-5 space-y-4">
      <Paper elevation={0} className="border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{TEXT.title}</Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
            {category.title} {TEXT.addItem}
          </Button>
        </div>
        {hasError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {errorMessage || TEXT.error}
          </Alert>
        )}
      </Paper>

      <Paper elevation={0} className="border border-slate-200 bg-white">
        <Tabs value={tab} onChange={changeTab} variant="scrollable" scrollButtons="auto" sx={{ px: 2 }}>
          {categories.map((item) => <Tab key={item.groupCode} label={item.tabLabel} />)}
        </Tabs>
      </Paper>

      <Paper elevation={0} className="border border-slate-200 bg-white p-5">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{TEXT.code}</TableCell>
                <TableCell>{category.fieldLabel}</TableCell>
                <TableCell>{TEXT.status}</TableCell>
                <TableCell>{TEXT.memo}</TableCell>
                <TableCell align="center">{TEXT.manage}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((code) => (
                <TableRow key={`${code.groupCode}-${code.detailCode}`} hover>
                  <TableCell className="font-mono text-xs text-slate-600">{code.detailCode}</TableCell>
                  <TableCell>{code.label}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={code.isActive ? TEXT.active : TEXT.inactive}
                      color={code.isActive ? 'success' : 'default'}
                      variant={code.isActive ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>{code.etc || '-'}</TableCell>
                  <TableCell align="center">
                    <div className="flex h-full items-center justify-center gap-1">
                      <Tooltip title={TEXT.edit}>
                        <IconButton size="small" onClick={() => selectCode(code)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={TEXT.delete}>
                        <IconButton size="small" color="error" onClick={() => deleteCode(code.detailCode)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {TEXT.empty}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{category.title} {editingDetailCode ? TEXT.edit : TEXT.insert}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important' }}>
          <TextField
            fullWidth
            label={TEXT.code}
            value={displayDetailCode}
            disabled={Boolean(editingDetailCode)}
            onChange={(event) => setForm({ ...form, detailCode: event.target.value.trim().toUpperCase() })}
          />
          <TextField
            fullWidth
            label={category.fieldLabel}
            placeholder={category.fieldPlaceholder}
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
          />
          <TextField
            fullWidth
            label={TEXT.memo}
            placeholder={TEXT.memoPlaceholder}
            value={form.etc}
            onChange={(event) => setForm({ ...form, etc: event.target.value })}
          />
          <FormControlLabel
            control={(
              <Checkbox
                checked={form.isActive}
                onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
              />
            )}
            label={TEXT.active}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDialog}>{TEXT.cancel}</Button>
          <Button
            variant="contained"
            disabled={!form.label.trim() || !displayDetailCode.trim() || isSaving}
            onClick={saveCode}
          >
            {editingDetailCode ? TEXT.modify : TEXT.insert}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
