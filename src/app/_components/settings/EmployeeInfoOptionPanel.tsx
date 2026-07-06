'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  Stack,
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
  title: '직원 정보 항목 관리',
  description: '직원 등록/수정 화면에서 선택할 항목을 관리합니다.',
  note: '항목을 추가하면 직원 등록/수정 화면의 선택 목록에 사용됩니다.',
  error: '저장 중 오류가 발생했습니다. 백엔드 저장 API 확인이 필요합니다.',
  sort: '표시 순서',
  active: '현재 사용',
  inactive: '미사용',
  descriptionField: '설명',
  descriptionPlaceholder: '예: 직원 정보 관리에서만 사용',
  reset: '입력값 초기화',
  insert: '추가',
  modify: '변경 저장',
  edit: '수정',
  delete: '삭제',
  status: '상태',
  manage: '관리',
  empty: '아직 등록된 항목이 없습니다.',
  confirmDelete: '선택한 항목을 삭제하시겠습니까?',
};

const categories = [
  {
    groupCode: 'G_RANK_CODE',
    tabLabel: '직급',
    title: '직급 목록',
    fieldLabel: '직급명',
    fieldPlaceholder: '예: 사원, 주임, 대리',
    addHelp: '회사에서 사용하는 직급을 추가합니다.',
    codePrefix: 'RANK',
  },
  {
    groupCode: 'G_WORK_TYPE',
    tabLabel: '근무유형',
    title: '근무유형 목록',
    fieldLabel: '근무유형명',
    fieldPlaceholder: '예: 일반근무, 교대근무',
    addHelp: '직원이 어떤 근무 방식에 해당하는지 구분합니다.',
    codePrefix: 'WORK',
  },
  {
    groupCode: 'G_HOLD_STATUS',
    tabLabel: '재직상태',
    title: '재직상태 목록',
    fieldLabel: '재직상태명',
    fieldPlaceholder: '예: 재직, 휴직, 퇴사',
    addHelp: '직원의 현재 재직 여부를 구분합니다.',
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

  const rows = useMemo(
    () => codes
      .filter((code) => code.groupCode === category.groupCode)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
    [codes, category.groupCode],
  );

  const resetForm = (groupCode = category.groupCode) => {
    setEditingDetailCode(null);
    setForm(emptyForm(groupCode));
  };

  const changeTab = (_event: React.SyntheticEvent, nextTab: number) => {
    setTab(nextTab);
    resetForm(categories[nextTab].groupCode);
  };

  const selectCode = (code: CommonCode) => {
    setEditingDetailCode(code.detailCode);
    setForm({ ...code });
  };

  const saveCode = () => {
    const payload = {
      ...form,
      groupCode: category.groupCode,
      detailCode: editingDetailCode ?? createNextCode(category.codePrefix, rows),
      label: form.label.trim(),
      sortOrder: Number(form.sortOrder) || 0,
    };

    const mutation = editingDetailCode ? modifyMutation : insertMutation;
    mutation.mutate(payload, { onSuccess: () => resetForm(category.groupCode) });
  };

  const deleteCode = (detailCode: string) => {
    if (!window.confirm(TEXT.confirmDelete)) return;
    deleteMutation.mutate(detailCode, { onSuccess: () => resetForm(category.groupCode) });
  };

  const isSaving = insertMutation.isPending || modifyMutation.isPending || deleteMutation.isPending;
  const hasError = codesQuery.isError || insertMutation.isError || modifyMutation.isError || deleteMutation.isError;
  const actionLabel = `${category.tabLabel} ${editingDetailCode ? TEXT.modify : TEXT.insert}`;

  return (
    <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{TEXT.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {TEXT.description}
          </Typography>
        </Box>

        <Alert severity="info">{TEXT.note}</Alert>
        {hasError && <Alert severity="warning">{TEXT.error}</Alert>}

        <Tabs value={tab} onChange={changeTab} variant="scrollable" scrollButtons="auto">
          {categories.map((item) => <Tab key={item.groupCode} label={item.tabLabel} />)}
        </Tabs>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3">
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{category.title}</Typography>
            <Typography variant="body2" color="text.secondary">{category.addHelp}</Typography>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.4fr_120px_140px]">
            <TextField
              size="small"
              label={category.fieldLabel}
              placeholder={category.fieldPlaceholder}
              value={form.label}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
            />
            <TextField
              size="small"
              type="number"
              label={TEXT.sort}
              value={form.sortOrder}
              onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })}
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
              className="md:col-span-3"
              size="small"
              label={TEXT.descriptionField}
              placeholder={TEXT.descriptionPlaceholder}
              value={form.etc}
              onChange={(event) => setForm({ ...form, etc: event.target.value })}
            />
          </div>

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => resetForm()} disabled={isSaving}>{TEXT.reset}</Button>
            <Button
              variant="contained"
              disabled={!form.label.trim() || isSaving}
              onClick={saveCode}
            >
              {actionLabel}
            </Button>
          </Stack>
        </section>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{category.fieldLabel}</TableCell>
                <TableCell align="right">{TEXT.sort}</TableCell>
                <TableCell>{TEXT.status}</TableCell>
                <TableCell>{TEXT.descriptionField}</TableCell>
                <TableCell align="right">{TEXT.manage}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((code) => (
                <TableRow key={`${code.groupCode}-${code.detailCode}`} hover>
                  <TableCell>{code.label}</TableCell>
                  <TableCell align="right">{code.sortOrder}</TableCell>
                  <TableCell>{code.isActive ? TEXT.active : TEXT.inactive}</TableCell>
                  <TableCell>{code.etc || '-'}</TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => selectCode(code)}>{TEXT.edit}</Button>
                    <Button size="small" color="error" onClick={() => deleteCode(code.detailCode)}>{TEXT.delete}</Button>
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
      </Stack>
    </Paper>
  );
}
