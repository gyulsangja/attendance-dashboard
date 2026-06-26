'use client';

import { Edit, StopCircle } from '@mui/icons-material';
import { Chip, IconButton, Paper, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { koKR } from '@mui/x-data-grid/locales';
import type { AttendanceCodeHistory } from '@/store/slices/attendanceCodeSlice';
import type { AttendanceCode } from '@/types/domain';

type AttendanceCodeSettingsGridProps = {
  tab: number;
  asOfDate: string;
  visibleCodes: AttendanceCode[];
  history: AttendanceCodeHistory[];
  onTabChange: (tab: number) => void;
  onDateChange: (date: string) => void;
  onEdit: (code: AttendanceCode) => void;
  onEnd: (code: AttendanceCode) => void;
  actionsDisabled?: boolean;
};

const TEXT = {
  label: '\uadfc\ud0dc\ucf54\ub4dc\uba85',
  schedulable: '\uc6b4\uc601\uad00\ub9ac \uc785\ub825',
  canInput: '\uc785\ub825 \uac00\ub2a5',
  autoJudgement: '\uc790\ub3d9\ud310\uc815',
  exceptional: '\ud2b9\uc774\uadfc\ud0dc',
  show: '\ud45c\uc2dc',
  hide: '\ubbf8\ud45c\uc2dc',
  startDate: '\uc0ac\uc6a9 \uc2dc\uc791\uc77c',
  manage: '\uad00\ub9ac',
  edit: '\uc218\uc815',
  endUse: '\uc0ac\uc6a9 \uc885\ub8cc',
  apiPending: 'API \uc218\uc815 \ubbf8\uad6c\ud604',
  codeTab: '\uadfc\ud0dc\ucf54\ub4dc',
  historyTab: '\ubcc0\uacbd \uc774\ub825',
  baseDate: '\uae30\uc900\uc77c',
  effectiveDate: '\uc801\uc6a9\uc77c',
  changeType: '\ubcc0\uacbd \uc720\ud615',
  detail: '\ubcc0\uacbd \ub0b4\uc6a9',
};

const gridSx = {
  borderColor: '#e2e8f0',
  '& .MuiDataGrid-columnHeader': { bgcolor: '#f8fafc' },
  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700 },
};

export default function AttendanceCodeSettingsGrid({
  tab,
  asOfDate,
  visibleCodes,
  history,
  onTabChange,
  onDateChange,
  onEdit,
  onEnd,
  actionsDisabled = false,
}: AttendanceCodeSettingsGridProps) {
  const codeColumns: GridColDef<AttendanceCode>[] = [
    { field: 'label', headerName: TEXT.label, minWidth: 150, flex: 1 },
    {
      field: 'isSchedulable',
      headerName: TEXT.schedulable,
      minWidth: 150,
      flex: 1,
      renderCell: ({ value }) => (
        <Chip size="small" label={value ? TEXT.canInput : TEXT.autoJudgement} />
      ),
    },
    {
      field: 'isExceptional',
      headerName: TEXT.exceptional,
      minWidth: 120,
      flex: 0.8,
      renderCell: ({ value }) => (
        <Chip size="small" label={value ? TEXT.show : TEXT.hide} color={value ? 'warning' : 'default'} />
      ),
    },
    { field: 'startDate', headerName: TEXT.startDate, minWidth: 130, flex: 0.9 },
    {
      field: 'actions',
      headerName: TEXT.manage,
      minWidth: 100,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <div className="flex h-full items-center">
          <Tooltip title={actionsDisabled ? TEXT.apiPending : TEXT.edit}>
            <span>
              <IconButton size="small" disabled={actionsDisabled} onClick={() => onEdit(row)}>
                <Edit fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={actionsDisabled ? TEXT.apiPending : TEXT.endUse}>
            <span>
              <IconButton size="small" color="error" disabled={actionsDisabled} onClick={() => onEnd(row)}>
                <StopCircle fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      ),
    },
  ];

  const historyColumns: GridColDef<AttendanceCodeHistory>[] = [
    { field: 'effectiveDate', headerName: TEXT.effectiveDate, minWidth: 130, flex: 0.8 },
    { field: 'codeLabel', headerName: TEXT.label, minWidth: 140, flex: 0.8 },
    { field: 'changeType', headerName: TEXT.changeType, minWidth: 120, flex: 0.8 },
    { field: 'detail', headerName: TEXT.detail, minWidth: 260, flex: 2 },
  ];

  const gridProps = {
    pageSizeOptions: [10, 20],
    initialState: { pagination: { paginationModel: { page: 0, pageSize: 10 } } },
    disableRowSelectionOnClick: true,
    localeText: koKR.components.MuiDataGrid.defaultProps.localeText,
    sx: gridSx,
  };

  return (
    <Paper elevation={0} className="border border-slate-200">
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <Tabs value={tab} onChange={(_event, value) => onTabChange(value)}>
          <Tab label={TEXT.codeTab} />
          <Tab label={TEXT.historyTab} />
        </Tabs>
        <TextField
          size="small"
          type="date"
          label={TEXT.baseDate}
          value={asOfDate}
          onChange={(event) => onDateChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </div>

      <div className="h-[590px] p-5 pt-3">
        {tab === 0 ? (
          <DataGrid rows={visibleCodes} columns={codeColumns} {...gridProps} />
        ) : (
          <DataGrid
            rows={[...history].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))}
            columns={historyColumns}
            {...gridProps}
          />
        )}
      </div>
    </Paper>
  );
}

