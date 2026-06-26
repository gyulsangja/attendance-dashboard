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
  title: '\uc9c1\uc6d0 \uc815\ubcf4 \ud56d\ubaa9 \uad00\ub9ac',
  description: '\uc9c1\uc6d0 \ub4f1\ub85d/\uc218\uc815 \ud654\uba74\uc5d0\uc11c \uc120\ud0dd\ud560 \ud56d\ubaa9\uc744 \uad00\ub9ac\ud569\ub2c8\ub2e4.',
  note: '\ud56d\ubaa9\uc744 \ucd94\uac00\ud558\uba74 \uc9c1\uc6d0 \ub4f1\ub85d/\uc218\uc815 \ud654\uba74\uc758 \uc120\ud0dd \ubaa9\ub85d\uc5d0 \uc0ac\uc6a9\ub429\ub2c8\ub2e4.',
  error: '\uc800\uc7a5 \uc911 \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4. \ubc31\uc5d4\ub4dc \uc800\uc7a5 API \ud655\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.',
  sort: '\ud45c\uc2dc \uc21c\uc11c',
  active: '\ud604\uc7ac \uc0ac\uc6a9',
  inactive: '\ubbf8\uc0ac\uc6a9',
  descriptionField: '\uc124\uba85',
  descriptionPlaceholder: '\uc608: \uc9c1\uc6d0 \uc815\ubcf4 \uad00\ub9ac\uc5d0\uc11c\ub9cc \uc0ac\uc6a9',
  reset: '\uc785\ub825\uac12 \ucd08\uae30\ud654',
  insert: '\ucd94\uac00',
  modify: '\ubcc0\uacbd \uc800\uc7a5',
  edit: '\uc218\uc815',
  delete: '\uc0ad\uc81c',
  status: '\uc0c1\ud0dc',
  manage: '\uad00\ub9ac',
  empty: '\uc544\uc9c1 \ub4f1\ub85d\ub41c \ud56d\ubaa9\uc774 \uc5c6\uc2b5\ub2c8\ub2e4.',
  confirmDelete: '\uc120\ud0dd\ud55c \ud56d\ubaa9\uc744 \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?',
};

const categories = [
  {
    groupCode: 'G_RANK_CODE',
    tabLabel: '\uc9c1\uae09',
    title: '\uc9c1\uae09 \ubaa9\ub85d',
    fieldLabel: '\uc9c1\uae09\uba85',
    fieldPlaceholder: '\uc608: \uc0ac\uc6d0, \uc8fc\uc784, \ub300\ub9ac',
    addHelp: '\ud68c\uc0ac\uc5d0\uc11c \uc0ac\uc6a9\ud558\ub294 \uc9c1\uae09\uc744 \ucd94\uac00\ud569\ub2c8\ub2e4.',
    codePrefix: 'RANK',
  },
  {
    groupCode: 'G_WORK_TYPE',
    tabLabel: '\uadfc\ubb34\uc720\ud615',
    title: '\uadfc\ubb34\uc720\ud615 \ubaa9\ub85d',
    fieldLabel: '\uadfc\ubb34\uc720\ud615\uba85',
    fieldPlaceholder: '\uc608: \uc77c\ubc18\uadfc\ubb34, \uad50\ub300\uadfc\ubb34',
    addHelp: '\uc9c1\uc6d0\uc774 \uc5b4\ub5a4 \uadfc\ubb34 \ubc29\uc2dd\uc5d0 \ud574\ub2f9\ud558\ub294\uc9c0 \uad6c\ubd84\ud569\ub2c8\ub2e4.',
    codePrefix: 'WORK',
  },
  {
    groupCode: 'G_HOLD_STATUS',
    tabLabel: '\uc7ac\uc9c1\uc0c1\ud0dc',
    title: '\uc7ac\uc9c1\uc0c1\ud0dc \ubaa9\ub85d',
    fieldLabel: '\uc7ac\uc9c1\uc0c1\ud0dc\uba85',
    fieldPlaceholder: '\uc608: \uc7ac\uc9c1, \ud734\uc9c1, \ud1f4\uc0ac',
    addHelp: '\uc9c1\uc6d0\uc758 \ud604\uc7ac \uc7ac\uc9c1 \uc5ec\ubd80\ub97c \uad6c\ubd84\ud569\ub2c8\ub2e4.',
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
