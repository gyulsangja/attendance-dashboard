'use client';

import { CheckCircle } from '@mui/icons-material';
import { Alert, Box, Chip, Paper, Tab, Tabs } from '@mui/material';
import type { ManagementOperations } from './useManagementOperations';
import ConfirmPanel from './ConfirmPanel';
import DevicePanel from './DevicePanel';
import OperationProgress from './OperationProgress';
import SchedulePanel from './SchedulePanel';
import ShiftPanel from './ShiftPanel';

type Props = Pick<
  ManagementOperations,
  'access' | 'actions' | 'dialogs' | 'setTab' | 'state' | 'tab'
>;

export default function OperationManagementSection({
  access,
  actions,
  dialogs,
  setTab,
  state,
  tab,
}: Props) {
  const {
    confirmed,
    deviceRecords,
    deviceRecordsApiError,
    deviceUpload,
    displayedWeekSchedules,
    month,
    pendingShifts,
    shiftWeekConfirmed,
    shifts,
    steps,
    templateEmployees,
    week,
    weekCsvUploaded,
    weekDays,
    weeklyReport,
    year,
  } = state;

  return (
    <>
      <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <p className="font-bold">{week.label}</p>
          <p className="mt-1 text-sm text-slate-500">
            {week.startDate} ~ {week.endDate}
          </p>
        </div>
        <Chip
          icon={confirmed ? <CheckCircle /> : undefined}
          label={confirmed ? '현황통계 반영 완료' : '입력 진행 중'}
          color={confirmed ? 'success' : 'default'}
        />
      </div>

      <OperationProgress steps={steps} active={tab} onChange={setTab} />

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ px: 2, borderBottom: '1px solid #e2e8f0' }}
        >
          <Tab label="근태 일정 입력" />
          <Tab label="단말기 CSV" />
          <Tab label="교대근무 확정" />
          <Tab label="운영관리 확정" />
        </Tabs>
        {confirmed && (
          <Alert severity="warning" sx={{ mx: 3, mt: 2 }}>
            이 주차는 운영관리 최종 확정 상태입니다. 내용을 변경하려면 운영관리 확정 탭에서 먼저 확정을 해제하세요.
          </Alert>
        )}
        <Box sx={{ p: 3 }}>
          {tab === 0 && (
            <SchedulePanel
              rows={displayedWeekSchedules}
              onAdd={() => dialogs.setScheduleOpen(true)}
              onEdit={dialogs.setEditingSchedule}
              onDelete={actions.deleteSchedule}
              locked={confirmed}
            />
          )}
          {tab === 1 && (
            <DevicePanel
              uploaded={weekCsvUploaded}
              uploadSummary={
                deviceUpload?.startDate === week.startDate
                && deviceUpload.endDate === week.endDate
                  ? deviceUpload
                  : null
              }
              apiError={deviceRecordsApiError}
              onUpload={actions.handleDeviceUpload}
              templateEmployees={templateEmployees}
              days={weekDays}
              records={deviceRecords}
              schedules={displayedWeekSchedules}
              onEdit={actions.openTimeEditor}
              locked={confirmed}
              recordsReadOnly={false}
            />
          )}
          {tab === 2 && (
            <ShiftPanel
              key={`manager-${year}-${month}`}
              rows={shifts}
              year={year}
              month={month}
              selectedWeek={{ startDate: week.startDate, endDate: week.endDate }}
              confirmed={shiftWeekConfirmed}
              onAdd={() => dialogs.setShiftOpen(true)}
              onToggleConfirm={actions.toggleShiftWeekConfirmed}
              onEdit={dialogs.setEditingShift}
              canInput={access.canInputShifts && !confirmed}
              canApprove={access.canApproveShifts && !confirmed}
            />
          )}
          {tab === 3 && (
            <ConfirmPanel
              steps={steps}
              confirmed={confirmed}
              csvUploaded={weekCsvUploaded}
              pendingShifts={pendingShifts}
              weeklyReport={weeklyReport}
              onToggle={actions.toggleConfirmed}
            />
          )}
        </Box>
      </Paper>
    </>
  );
}
