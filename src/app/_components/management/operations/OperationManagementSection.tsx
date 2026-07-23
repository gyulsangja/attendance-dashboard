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
    attendManagerApiError,
    attendManagerApiLoading,
    attendanceCodes,
    confirmed,
    deviceRecords,
    deviceRecordsApiError,
    deviceUpload,
    displayedWeekSchedules,
    month,
    schedulesApiError,
    schedulesApiLoading,
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
          label={confirmed ? '검토완료' : '검토중'}
          color={confirmed ? 'success' : 'default'}
        />
      </div>

      <OperationProgress steps={steps} active={tab} onChange={setTab} />
      {attendManagerApiLoading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          운영관리 데이터를 불러오는 중입니다.
        </Alert>
      )}
      {attendManagerApiError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          운영관리 일부 정보를 불러오지 못했습니다. 확인된 데이터만 표시합니다.
        </Alert>
      )}
      {actions.apiMutating && (
        <Alert severity="info" sx={{ mt: 2 }}>
          운영관리 요청을 처리 중입니다.
        </Alert>
      )}
      {schedulesApiLoading && (
        <Alert severity="info" sx={{ mt: 2 }}>
          근태 일정 목록을 불러오는 중입니다.
        </Alert>
      )}
      {schedulesApiError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          근태 일정 목록을 불러오지 못했습니다.
        </Alert>
      )}
      {actions.apiMutationError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {actions.apiMutationError}
        </Alert>
      )}
      {actions.scheduleSaveResult && actions.scheduleSaveResult.totalCount > 0 && (
        <Alert
          severity={
            actions.scheduleSaveResult.failureCount === 0
              ? 'success'
              : actions.scheduleSaveResult.successCount === 0
                ? 'error'
                : 'warning'
          }
          sx={{ mt: 2 }}
        >
          {actions.scheduleSaveResult.failureCount === 0 && (
            <>근태 일정 저장이 완료되었습니다.</>
          )}
          {actions.scheduleSaveResult.failureCount > 0 && (
            <>
              <p>
                {actions.scheduleSaveResult.successCount > 0
                  ? '일부 근태 일정만 저장되었습니다. 저장되지 않은 항목을 확인해 다시 처리하세요.'
                  : '근태 일정이 저장되지 않았습니다. 아래 항목을 확인해 다시 처리하세요.'}
              </p>
              <ul className="mt-2 list-disc pl-5">
                {actions.scheduleSaveResult.failures.slice(0, 5).map(({ schedule, message }) => (
                  <li key={`${schedule.date}-${schedule.employeeNo ?? schedule.employeeId}-${schedule.codeId}`}>
                    {schedule.date} {schedule.department} {schedule.name} {schedule.detail}
                    {message ? ` - ${message}` : ''}
                  </li>
                ))}
              </ul>
              {actions.scheduleSaveResult.failures.length > 5 && (
                <p className="mt-2">
                  외 {actions.scheduleSaveResult.failures.length - 5}건이 더 저장되지 않았습니다.
                </p>
              )}
            </>
          )}
        </Alert>
      )}

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
          <Tab label="출입통제데이터" />
          <Tab label="교대근무 일정" />
          <Tab label="주차 검토완료" />
        </Tabs>
        {confirmed && (
          <Alert severity="warning" sx={{ mx: 3, mt: 2 }}>
            이 주차는 검토완료 상태입니다. 내용을 변경하려면 주차 검토완료 탭에서 먼저 검토완료를 취소하세요.
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
              uploadHistory={state.uploadHistory}
              uploadSummary={
                deviceUpload?.startDate === week.startDate
                && deviceUpload.endDate === week.endDate
                  ? deviceUpload
                  : null
              }
              apiError={deviceRecordsApiError}
              onUpload={actions.handleDeviceUpload}
              onDeleteUpload={actions.deleteDeviceUpload}
              onUpdateAttendance={actions.updateAttendanceJudgement}
              onSendAttendanceMail={actions.sendAttendanceMail}
              templateEmployees={templateEmployees}
              days={weekDays}
              records={deviceRecords}
              schedules={displayedWeekSchedules}
              attendanceCodes={attendanceCodes}
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
              confirmed={confirmed}
              onAdd={() => dialogs.setShiftOpen(true)}
              onEdit={dialogs.setEditingShift}
              canInput={access.canInputShifts && !confirmed}
            />
          )}
          {tab === 3 && (
            <ConfirmPanel
              steps={steps}
              confirmed={confirmed}
              csvUploaded={weekCsvUploaded}
              weeklyReport={weeklyReport}
              onToggle={actions.toggleConfirmed}
            />
          )}
        </Box>
      </Paper>
    </>
  );
}
