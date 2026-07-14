'use client';

import { useMemo, useState, type SyntheticEvent } from 'react';
import { Add } from '@mui/icons-material';
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
  title: '직원 항목 관리',
  description: '직원 등록과 수정 화면에서 선택하는 직급, 근무유형, 재직상태 항목을 관리합니다.',
  note: '항목을 추가하거나 이름을 변경하면 직원 관리 화면의 선택지에 반영됩니다.',
  error: '항목 저장 중 오류가 발생했습니다.',
  addItem: '항목 추가',
  active: '사용',
  inactive: '미사용',
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
    addHelp: '직원 등록 시 선택할 회사 직급을 관리합니다.',
    codePrefix: 'RANK',
  },
  {
    groupCode: 'G_WORK_TYPE',
    tabLabel: '근무유형',
    title: '근무유형',
    fieldLabel: '근무유형명',
    fieldPlaceholder: '예: 일반근무, 교대근무',
    addHelp: '일반근무와 교대근무 등 직원의 근무 방식을 구분합니다.',
    codePrefix: 'WORK',
  },
  {
    groupCode: 'G_HOLD_STATUS',
    tabLabel: '재직상태',
    title: '재직상태',
    fieldLabel: '재직상태명',
    fieldPlaceholder: '예: 재직, 휴직, 퇴사',
    addHelp: '직원의 현재 재직 상태를 구분합니다.',
    codePrefix: 'HOLD',
  },
] as const;

const emptyForm = (groupCode: string = categories[0].groupCode): CommonCode => ({
  groupCode,
  detailCode: '',
  label: '',
  sortOrder: 99,
  isActive: true,
  refVal1: '',
  refVal2: '',
  etc: '',
});

const createNextCode = (prefix: string, rows: CommonCode[]) => {
  const maxNumber = rows.reduce((max, row) => {
    const match = row.detailCode.match(new RegExp(`^${prefix}_(\\d+)$`));
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `${prefix}_${String(maxNumber + 1).padStart(2, '0')}`;
};

const createNextSortOrder = (rows: CommonCode[]) =>
  rows.reduce((max, row) => Math.max(max, Number(row.sortOrder) || 0), 0) + 1;

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
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
    [codes, category.groupCode],
  );

  const closeDialog = () => {
    setEditingDetailCode(null);
    setForm(emptyForm(category.groupCode));
    setDialogOpen(false);
  };

  const openAddDialog = () => {
    setEditingDetailCode(null);
    setForm(emptyForm(category.groupCode));
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
    setForm({ ...code });
    setDialogOpen(true);
  };

  const saveCode = () => {
    const payload = {
      ...form,
      groupCode: category.groupCode,
      detailCode: editingDetailCode ?? createNextCode(category.codePrefix, rows),
      label: form.label.trim(),
      sortOrder: editingDetailCode ? form.sortOrder : createNextSortOrder(rows),
    };

    const mutation = editingDetailCode ? modifyMutation : insertMutation;
    mutation.mutate(payload, { onSuccess: closeDialog });
  };

  const deleteCode = (detailCode: string) => {
    if (!window.confirm(TEXT.confirmDelete)) return;
    deleteMutation.mutate(detailCode, { onSuccess: closeDialog });
  };

  const isSaving = insertMutation.isPending || modifyMutation.isPending || deleteMutation.isPending;
  const hasError = codesQuery.isError || insertMutation.isError || modifyMutation.isError || deleteMutation.isError;

  return (
    <section className="mt-5 space-y-4">
      <Paper elevation={0} className="border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{TEXT.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {TEXT.description}
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}>
            {category.title} {TEXT.addItem}
          </Button>
        </div>
        <Alert severity="info" sx={{ mt: 2 }}>{TEXT.note}</Alert>
        {hasError && <Alert severity="warning" sx={{ mt: 2 }}>{TEXT.error}</Alert>}
      </Paper>

      <Paper elevation={0} className="border border-slate-200 bg-white">
        <Tabs value={tab} onChange={changeTab} variant="scrollable" scrollButtons="auto" sx={{ px: 2 }}>
          {categories.map((item) => <Tab key={item.groupCode} label={item.tabLabel} />)}
        </Tabs>
      </Paper>

      <Paper elevation={0} className="border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{category.title}</Typography>
          <Typography variant="body2" color="text.secondary">{category.addHelp}</Typography>
        </div>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{category.fieldLabel}</TableCell>
                <TableCell>{TEXT.status}</TableCell>
                <TableCell>{TEXT.memo}</TableCell>
                <TableCell align="right">{TEXT.manage}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((code) => (
                <TableRow key={`${code.groupCode}-${code.detailCode}`} hover>
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
                  <TableCell align="right">
                    <Button size="small" onClick={() => selectCode(code)}>{TEXT.edit}</Button>
                    <Button size="small" color="error" onClick={() => deleteCode(code.detailCode)}>{TEXT.delete}</Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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
        <DialogContent className="space-y-4 pt-3!">
          <TextField
            fullWidth
            label={category.fieldLabel}
            placeholder={category.fieldPlaceholder}
            value={form.label}
            onChange={(event) => setForm({ ...form, label: event.target.value })}
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
          <TextField
            fullWidth
            label={TEXT.memo}
            placeholder={TEXT.memoPlaceholder}
            value={form.etc}
            onChange={(event) => setForm({ ...form, etc: event.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDialog}>{TEXT.cancel}</Button>
          <Button
            variant="contained"
            disabled={!form.label.trim() || isSaving}
            onClick={saveCode}
          >
            {editingDetailCode ? TEXT.modify : TEXT.insert}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}
