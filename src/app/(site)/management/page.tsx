'use client';

import { useMemo, useState } from 'react';
import { Alert, Box, Chip, Paper, Tab, Tabs } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import {
  type OperationSchedule,
} from '@/mocks';
import { getWeeksInMonth } from '@/lib/date';
import { useAccess } from '@/app/_components/auth/AccessProvider';
import OperationHeader from '@/app/_components/management/operations/OperationHeader';
import OperationProgress, { type OperationStep } from '@/app/_components/management/operations/OperationProgress';
import SchedulePanel from '@/app/_components/management/operations/SchedulePanel';
import DevicePanel from '@/app/_components/management/operations/DevicePanel';
import ShiftPanel from '@/app/_components/management/operations/ShiftPanel';
import ConfirmPanel from '@/app/_components/management/operations/ConfirmPanel';
import ScheduleEntryDialog from '@/app/_components/management/operations/dialogs/ScheduleEntryDialog';
import ShiftEntryDialog from '@/app/_components/management/operations/dialogs/ShiftEntryDialog';
import ScheduleEditDialog from '@/app/_components/management/operations/dialogs/ScheduleEditDialog';
import TimeEditDialog, { type EditingTime } from '@/app/_components/management/operations/dialogs/TimeEditDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addSchedules,
  addShifts,
  confirmAllShifts,
  deleteDeviceRecord,
  deleteSchedule,
  saveDeviceRecord,
  setCsvUploaded,
  setOperationMonth,
  setOperationWeek,
  setOperationYear,
  setShiftConfirmed,
  toggleManagementConfirmed,
  updateSchedule,
} from '@/store/slices/managementSlice';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';

export default function Page() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const {
    year,
    month,
    weekNumber,
    schedules,
    shifts,
    deviceRecords,
    csvUploaded,
    confirmed,
  } = useAppSelector((state) => state.management);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const [tab, setTab] = useState(0);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<OperationSchedule | null>(null);
  const [editingTime, setEditingTime] = useState<EditingTime | null>(null);

  const weekOptions = useMemo(
    () => getWeeksInMonth(year, month),
    [year, month],
  );
  const selectedWeek = weekOptions.find(
    (item) => item.week === weekNumber,
  ) ?? weekOptions[0];
  const week = {
    label: `${year}년 ${month}월 ${selectedWeek?.week ?? 1}주차`,
    startDate: selectedWeek?.startDate ?? `${year}-${String(month).padStart(2, '0')}-01`,
    endDate: selectedWeek?.endDate ?? `${year}-${String(month).padStart(2, '0')}-07`,
  };
  const attendanceCodes = getAttendanceCodesAtDate(
    codeMaster.codes,
    codeMaster.history,
    week.endDate,
  );
  const weekDays = useMemo(() => {
    const days: { date: string; label: string }[] = [];
    const end = new Date(`${week.endDate}T00:00:00`);
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

    for (
      const current = new Date(`${week.startDate}T00:00:00`);
      current <= end;
      current.setDate(current.getDate() + 1)
    ) {
      days.push({
        date: current.toISOString().slice(0, 10),
        label: `${current.getMonth() + 1}/${current.getDate()} (${weekdays[current.getDay()]})`,
      });
    }
    return days;
  }, [week.startDate, week.endDate]);

  const weekSchedules = schedules.filter(
    (item) => item.date >= week.startDate && item.date <= week.endDate,
  );
  const displayedWeekSchedules = weekSchedules.map((schedule) => ({
    ...schedule,
    type: getAttendanceCodesAtDate(
      codeMaster.codes,
      codeMaster.history,
      schedule.date,
    ).find((code) => code.id === schedule.codeId)?.label ?? schedule.type,
  }));
  const weekShifts = shifts.filter(
    (item) => item.date >= week.startDate && item.date <= week.endDate,
  );

  const pendingShifts = weekShifts.filter(
    (item) => item.status === '승인대기',
  ).length;
  const steps: OperationStep[] = [
    { label: '근태 일정', value: `${weekSchedules.length}건 입력`, done: weekSchedules.length > 0 },
    { label: '단말기 CSV', value: csvUploaded ? '업로드 완료' : '미입력', done: csvUploaded },
    { label: '교대근무', value: pendingShifts ? `${pendingShifts}건 승인대기` : '확정 완료', done: pendingShifts === 0 },
    { label: '운영관리', value: confirmed ? '최종 확정' : '확정 전', done: confirmed },
  ];

  const saveEditedSchedule = () => {
    if (!editingSchedule) return;
    const snapshot = getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      editingSchedule.date,
    );
    const organizationEmployee = snapshot.employees.find(
      (item) => item.id === editingSchedule.employeeId,
    );
    const employee = organizationEmployee && {
      ...organizationEmployee,
      department: organizationEmployee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : snapshot.teams.find((team) => team.id === organizationEmployee.teamId)?.name ?? '-',
    };
    const code = attendanceCodes.find(
      (item) => item.id === editingSchedule.codeId,
    );
    if (!employee || !code) return;

    dispatch(updateSchedule({
      ...editingSchedule,
      department: employee.department,
      name: employee.name,
      type: code.label,
      detail: `${code.label} 입력`,
    }));
    setEditingSchedule(null);
  };

  const openTimeEditor = (employeeId: number, date: string) => {
    const record = deviceRecords.find(
      (item) => item.employeeId === employeeId && item.date === date,
    );
    const snapshot = getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      date,
    );
    const employee = snapshot.employees.find((item) => item.id === employeeId);
    const department = employee?.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : snapshot.teams.find((team) => team.id === employee?.teamId)?.name ?? '-';
    setEditingTime({
      employeeId,
      date,
      checkIn: record?.checkIn ?? '',
      checkOut: record?.checkOut ?? '',
      employeeName: employee?.name ?? '-',
      department,
      position: employee?.position ?? '-',
    });
  };

  const saveDeviceTime = () => {
    if (!editingTime) return;
    dispatch(saveDeviceRecord(editingTime));
    setEditingTime(null);
  };

  const deleteDeviceTime = () => {
    if (!editingTime) return;
    dispatch(deleteDeviceRecord({
      employeeId: editingTime.employeeId,
      date: editingTime.date,
    }));
    setEditingTime(null);
  };

  return (
    <main className="mx-auto max-w-[1600px]">
      <OperationHeader
        year={year}
        month={month}
        weekNumber={weekNumber}
        weekOptions={weekOptions}
        showPeriod={access.canManageOperations || access.canInputShifts}
        onYearChange={(value) => dispatch(setOperationYear(value))}
        onMonthChange={(value) => dispatch(setOperationMonth(value))}
        onWeekChange={(value) => dispatch(setOperationWeek(value))}
      />

      {!access.canManageOperations && !access.canInputShifts && (
        <Alert severity="warning" sx={{ mt: 5 }}>
          {access.roleLabel} 권한으로는 운영관리 메뉴를 사용할 수 없습니다.
        </Alert>
      )}

      {access.canManageOperations && (
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
            <Box sx={{ p: 3 }}>
              {tab === 0 && (
                <SchedulePanel
                  rows={displayedWeekSchedules}
                  onAdd={() => setScheduleOpen(true)}
                  onEdit={setEditingSchedule}
                  onDelete={(id) => dispatch(deleteSchedule(id))}
                />
              )}
              {tab === 1 && (
                <DevicePanel
                  uploaded={csvUploaded}
                  onUpload={() => dispatch(setCsvUploaded(true))}
                  days={weekDays}
                  records={deviceRecords}
                  schedules={displayedWeekSchedules}
                  onEdit={openTimeEditor}
                />
              )}
              {tab === 2 && (
                <ShiftPanel
                  rows={weekShifts}
                  onAdd={() => setShiftOpen(true)}
                  onConfirm={(id, value) => dispatch(
                    setShiftConfirmed({ id, confirmed: value }),
                  )}
                  onConfirmAll={() => dispatch(confirmAllShifts())}
                  canApprove
                />
              )}
              {tab === 3 && (
                <ConfirmPanel
                  steps={steps}
                  confirmed={confirmed}
                  csvUploaded={csvUploaded}
                  pendingShifts={pendingShifts}
                  onToggle={() => dispatch(toggleManagementConfirmed())}
                />
              )}
            </Box>
          </Paper>
        </>
      )}

      {access.canInputShifts && (
        <Paper
          elevation={0}
          sx={{ mt: 3, border: '1px solid #e2e8f0', borderRadius: 3, p: 3 }}
        >
          <Alert severity="info" sx={{ mb: 3 }}>
            기술팀 교대담당자는 일정 입력만 가능하며 확정은 경영관리팀에서 진행합니다.
          </Alert>
          <ShiftPanel
            rows={weekShifts}
            onAdd={() => setShiftOpen(true)}
            onConfirm={() => undefined}
            onConfirmAll={() => undefined}
            canInput
          />
        </Paper>
      )}

      <ScheduleEntryDialog
        open={scheduleOpen}
        existing={schedules}
        onClose={() => setScheduleOpen(false)}
        onSave={(items) => dispatch(addSchedules(items))}
      />
      <ShiftEntryDialog
        open={shiftOpen}
        existing={shifts}
        onClose={() => setShiftOpen(false)}
        onSave={(items) => dispatch(addShifts(items))}
      />
      <ScheduleEditDialog
        value={editingSchedule}
        onChange={setEditingSchedule}
        onSave={saveEditedSchedule}
      />
      <TimeEditDialog
        value={editingTime}
        canDelete={deviceRecords.some(
          (item) =>
            item.employeeId === editingTime?.employeeId
            && item.date === editingTime?.date,
        )}
        onChange={setEditingTime}
        onSave={saveDeviceTime}
        onDelete={deleteDeviceTime}
      />
    </main>
  );
}
