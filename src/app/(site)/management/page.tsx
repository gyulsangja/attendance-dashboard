'use client';

import { useMemo, useState } from 'react';
import { Alert, Box, Chip, Paper, Tab, Tabs } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import {
  type AttendanceRecord,
  type OperationSchedule,
  type ShiftSchedule,
} from '@/mocks';
import {
  formatDateKey,
  getWeeksInMonth,
  isKoreanPublicHoliday,
} from '@/lib/date';
import { decodeCsvFile, parseAttendanceCsv } from '@/lib/csv/parseAttendanceCsv';
import { evaluateAttendance } from '@/lib/attendance/evaluateAttendance';
import { useAccess } from '@/app/_components/auth/AccessProvider';
import OperationHeader from '@/app/_components/management/operations/OperationHeader';
import OperationProgress, { type OperationStep } from '@/app/_components/management/operations/OperationProgress';
import SchedulePanel from '@/app/_components/management/operations/SchedulePanel';
import DevicePanel from '@/app/_components/management/operations/DevicePanel';
import ShiftPanel from '@/app/_components/management/operations/ShiftPanel';
import ConfirmPanel from '@/app/_components/management/operations/ConfirmPanel';
import ScheduleEntryDialog from '@/app/_components/management/operations/dialogs/ScheduleEntryDialog';
import ShiftEntryDialog from '@/app/_components/management/operations/dialogs/ShiftEntryDialog';
import ShiftEditDialog from '@/app/_components/management/operations/dialogs/ShiftEditDialog';
import ScheduleEditDialog from '@/app/_components/management/operations/dialogs/ScheduleEditDialog';
import TimeEditDialog, { type EditingTime } from '@/app/_components/management/operations/dialogs/TimeEditDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addSchedules,
  addShifts,
  deleteDeviceRecord,
  deletePendingShift,
  deleteSchedule,
  saveDeviceRecord,
  setOperationMonth,
  setOperationWeek,
  setOperationYear,
  setShiftWeekConfirmed,
  toggleManagementConfirmed,
  uploadDeviceRecords,
  updatePendingShift,
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
    deviceUpload,
    confirmed,
    confirmedShiftWeekKeys,
  } = useAppSelector((state) => state.management);
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const [tab, setTab] = useState(0);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<OperationSchedule | null>(null);
  const [editingTime, setEditingTime] = useState<EditingTime | null>(null);
  const [editingShift, setEditingShift] = useState<ShiftSchedule | null>(null);

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
        date: formatDateKey(current),
        label: `${current.getMonth() + 1}/${current.getDate()} (${weekdays[current.getDay()]})`,
      });
    }
    return days;
  }, [week.startDate, week.endDate]);
  const templateSnapshot = getOrganizationSnapshot(
    organization.teams,
    organization.employees,
    organization.history,
    week.startDate,
  );
  const templateEmployees = templateSnapshot.employees.map((employee) => ({
    employeeName: employee.name,
    department: employee.teamId === UNASSIGNED_TEAM_ID
      ? UNASSIGNED_TEAM_NAME
      : templateSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
  }));
  const weekShiftWorkers = templateSnapshot.employees
    .filter((employee) => employee.shiftWorker)
    .map((employee) => ({ employeeId: employee.id, name: employee.name }));

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
  const weekDeviceRecords = deviceRecords.filter(
    (item) => item.date >= week.startDate && item.date <= week.endDate,
  );
  const weekTerminalRecords = weekDeviceRecords.filter(
    (item) => Boolean(item.checkIn || item.checkOut),
  );
  const weekCsvUploaded = weekTerminalRecords.length > 0;
  const shiftWeekConfirmed = confirmedShiftWeekKeys.includes(
    `${year}-${month}-${weekNumber}`,
  );
  const pendingShifts = weekShifts.length > 0 && !shiftWeekConfirmed
    ? weekShifts.length
    : 0;
  const steps: OperationStep[] = [
    { label: '근태 일정', value: `${weekSchedules.length}건 입력`, done: weekSchedules.length > 0 },
    {
      label: '단말기 CSV',
      value: weekCsvUploaded ? `${weekTerminalRecords.length}건 확인` : '업로드 필요',
      done: weekCsvUploaded,
    },
    {
      label: '교대근무',
      value: weekShifts.length === 0
        ? '일정 없음'
        : shiftWeekConfirmed ? '주차 확정' : '미확정',
      done: weekShifts.length === 0 || shiftWeekConfirmed,
    },
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
    const validCodeIds = new Set(
      getAttendanceCodesAtDate(
        codeMaster.codes,
        codeMaster.history,
        date,
      ).map((code) => code.id),
    );
    setEditingTime({
      employeeId,
      date,
      checkIn: record?.checkIn ?? '',
      checkOut: record?.checkOut ?? '',
      employeeName: employee?.name ?? '-',
      department,
      position: employee?.position ?? '-',
      attendanceCodeIds: [...new Set(
        record?.events
          .map((event) => event.codeId)
          .filter((codeId) => validCodeIds.has(codeId)) ?? [],
      )],
    });
  };

  const saveDeviceTime = () => {
    if (!editingTime) return;
    const validCodes = getAttendanceCodesAtDate(
      codeMaster.codes,
      codeMaster.history,
      editingTime.date,
    );
    const validCodeMap = new Map(
      validCodes.map((code) => [code.id, code.label]),
    );

    dispatch(saveDeviceRecord({
      ...editingTime,
      events: editingTime.attendanceCodeIds.flatMap((codeId) => {
        const label = validCodeMap.get(codeId);
        return label ? [{
          codeId,
          detail: `관리팀 확인: ${label}`,
        }] : [];
      }),
    }));
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

  const handleDeviceUpload = async (file: File) => {
    const parsed = parseAttendanceCsv(await decodeCsvFile(file));
    const errors = parsed.errors.map(
      (error) => `${error.row}행: ${error.message}`,
    );
    const importedRecords: AttendanceRecord[] = [];
    const importedKeys = new Set<string>();
    let nextId = Math.max(0, ...deviceRecords.map((record) => record.id)) + 1;
    const normalizeIdentity = (value: string) => value
      .normalize('NFKC')
      .replace(/\s+/g, '')
      .toLowerCase();

    parsed.rows.forEach((row) => {
      if (row.date < week.startDate || row.date > week.endDate) {
        errors.push(`${row.row}행: 선택한 주차(${week.startDate} ~ ${week.endDate})의 일자가 아닙니다.`);
        return;
      }

      const snapshot = getOrganizationSnapshot(
        organization.teams,
        organization.employees,
        organization.history,
        row.date,
      );
      const sameNameEmployees = snapshot.employees.filter(
        (item) => normalizeIdentity(item.name) === normalizeIdentity(row.employeeName),
      );
      const employees = sameNameEmployees.filter((item) => {
        const department = item.teamId === UNASSIGNED_TEAM_ID
          ? UNASSIGNED_TEAM_NAME
          : snapshot.teams.find((team) => team.id === item.teamId)?.name ?? '-';
        return normalizeIdentity(department) === normalizeIdentity(row.department);
      });
      const matchedEmployees = employees.length > 0 ? employees : sameNameEmployees;
      if (matchedEmployees.length === 0) {
        errors.push(`${row.row}행: ${row.department}의 ${row.employeeName} 구성원을 찾을 수 없습니다.`);
        return;
      }
      if (matchedEmployees.length > 1) {
        errors.push(`${row.row}행: ${row.department}에 동명이인이 있어 구성원을 구분할 수 없습니다.`);
        return;
      }
      const employee = matchedEmployees[0];
      const department = employee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : snapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-';
      const plannedSchedule = schedules.find(
        (item) => item.employeeId === employee.id && item.date === row.date,
      );
      const shiftSchedule = shifts.find(
        (item) => item.employeeId === employee.id && item.date === row.date,
      );
      const policy = codeMaster.workTimePolicy;
      const attendanceExempt = Boolean(
        plannedSchedule
        && !['HALF_AM', 'HALF_PM'].includes(plannedSchedule.codeId),
      );
      const rowDayOfWeek = new Date(`${row.date}T00:00:00`).getDay();
      const regularWeekday = rowDayOfWeek !== 0 && rowDayOfWeek !== 6;
      const regularHoliday = !employee.shiftWorker && isKoreanPublicHoliday(row.date);
      const attendanceRequired = employee.shiftWorker
        ? Boolean(shiftSchedule)
        : regularWeekday && !regularHoliday;
      const standard = employee.shiftWorker
        ? shiftSchedule?.checkIn && shiftSchedule.checkOut
          ? { checkIn: shiftSchedule.checkIn, checkOut: shiftSchedule.checkOut }
          : null
        : plannedSchedule?.codeId === 'HALF_AM'
          ? { checkIn: policy.halfAmStart, checkOut: policy.halfAmEnd }
          : plannedSchedule?.codeId === 'HALF_PM'
            ? { checkIn: policy.halfPmStart, checkOut: policy.halfPmEnd }
            : { checkIn: policy.regularStart, checkOut: policy.regularEnd };

      importedRecords.push({
        id: nextId,
        employeeId: employee.id,
        employeeName: employee.name,
        department,
        position: employee.position,
        date: row.date,
        checkIn: row.checkIn || undefined,
        checkOut: row.checkOut || undefined,
        events: attendanceExempt || regularHoliday
          ? []
          : attendanceRequired && !row.checkIn
            ? [{ codeId: 'ABSENT', detail: '출근시간 미등록' }]
          : evaluateAttendance(
            { checkIn: row.checkIn, checkOut: row.checkOut },
            standard,
          ),
      });
      importedKeys.add(`${employee.id}-${row.date}`);
      nextId += 1;
    });

    const terminalValidRows = importedRecords.length;
    weekDays.forEach((day) => {
      const dayOfWeek = new Date(`${day.date}T00:00:00`).getDay();
      const weekday = dayOfWeek !== 0 && dayOfWeek !== 6;
      const publicHoliday = isKoreanPublicHoliday(day.date);
      const snapshot = getOrganizationSnapshot(
        organization.teams,
        organization.employees,
        organization.history,
        day.date,
      );

      snapshot.employees.forEach((employee) => {
        if (importedKeys.has(`${employee.id}-${day.date}`)) return;
        const plannedSchedule = schedules.find(
          (item) => item.employeeId === employee.id && item.date === day.date,
        );
        const attendanceExempt = Boolean(
          plannedSchedule
          && !['HALF_AM', 'HALF_PM'].includes(plannedSchedule.codeId),
        );
        if (attendanceExempt) return;

        const shiftSchedule = shifts.find(
          (item) => item.employeeId === employee.id && item.date === day.date,
        );
        const attendanceRequired = employee.shiftWorker
          ? Boolean(shiftSchedule)
          : weekday && !publicHoliday;
        if (!attendanceRequired) return;

        const department = employee.teamId === UNASSIGNED_TEAM_ID
          ? UNASSIGNED_TEAM_NAME
          : snapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-';
        importedRecords.push({
          id: nextId,
          employeeId: employee.id,
          employeeName: employee.name,
          department,
          position: employee.position,
          date: day.date,
          events: [{ codeId: 'ABSENT', detail: '단말기 출퇴근 기록 없음' }],
        });
        nextId += 1;
      });
    });

    const summary = {
      fileName: file.name,
      uploadedAt: new Intl.DateTimeFormat('ko-KR', {
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(new Date()),
      startDate: week.startDate,
      endDate: week.endDate,
      totalRows: parsed.totalRows,
      validRows: terminalValidRows,
      errorRows: errors.length,
      absenceRows: importedRecords.length - terminalValidRows,
      errors,
    };

    if (importedRecords.length > 0) {
      dispatch(uploadDeviceRecords({
        records: importedRecords,
        summary,
        startDate: week.startDate,
        endDate: week.endDate,
      }));
    }
    return summary;
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
            {confirmed && (
              <Alert severity="warning" sx={{ mx: 3, mt: 2 }}>
                이 주차는 운영관리 최종 확정 상태입니다. 내용을 변경하려면 운영관리 확정 탭에서 먼저 확정을 해제하세요.
              </Alert>
            )}
            <Box sx={{ p: 3 }}>
              {tab === 0 && (
                <SchedulePanel
                  rows={displayedWeekSchedules}
                  onAdd={() => setScheduleOpen(true)}
                  onEdit={setEditingSchedule}
                  onDelete={(id) => dispatch(deleteSchedule(id))}
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
                  onUpload={handleDeviceUpload}
                  templateEmployees={templateEmployees}
                  days={weekDays}
                  records={deviceRecords}
                  schedules={displayedWeekSchedules}
                  onEdit={openTimeEditor}
                  locked={confirmed}
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
                  onAdd={() => setShiftOpen(true)}
                  onToggleConfirm={() => dispatch(setShiftWeekConfirmed({
                    startDate: week.startDate,
                    endDate: week.endDate,
                    confirmed: !shiftWeekConfirmed,
                  }))}
                  onEdit={setEditingShift}
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
                  onToggle={() => dispatch(toggleManagementConfirmed())}
                />
              )}
            </Box>
          </Paper>
        </>
      )}

      {access.canInputShifts && !access.canManageOperations && (
        <Paper
          elevation={0}
          sx={{ mt: 3, border: '1px solid #e2e8f0', borderRadius: 3, p: 3 }}
        >
          <Alert severity="info" sx={{ mb: 3 }}>
            교대근무 일정을 입력한 뒤 선택 주차 확정까지 진행해 주세요.
          </Alert>
          {confirmed && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              이 주차는 운영관리 최종 확정 상태이므로 교대근무 일정을 변경할 수 없습니다. 관리자에게 운영관리 확정 해제를 요청하세요.
            </Alert>
          )}
          <ShiftPanel
            key={`input-${year}-${month}`}
            rows={shifts}
            year={year}
            month={month}
            selectedWeek={{ startDate: week.startDate, endDate: week.endDate }}
            confirmed={shiftWeekConfirmed}
            onAdd={() => setShiftOpen(true)}
            onToggleConfirm={() => dispatch(setShiftWeekConfirmed({
              startDate: week.startDate,
              endDate: week.endDate,
              confirmed: !shiftWeekConfirmed,
            }))}
            onEdit={setEditingShift}
            canInput={!confirmed}
            canApprove={access.canApproveShifts && !confirmed}
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
        key={`${week.startDate}-${week.endDate}-${shiftOpen}`}
        open={shiftOpen}
        existing={shifts}
        workers={weekShiftWorkers}
        period={{ startDate: week.startDate, endDate: week.endDate }}
        onClose={() => setShiftOpen(false)}
        onSave={(items) => dispatch(addShifts(items))}
      />
      <ShiftEditDialog
        key={editingShift?.id ?? 'closed-shift-editor'}
        value={editingShift}
        onClose={() => setEditingShift(null)}
        onSave={(shift) => {
          dispatch(updatePendingShift(shift));
          setEditingShift(null);
        }}
        onDelete={(id) => {
          dispatch(deletePendingShift(id));
          setEditingShift(null);
        }}
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
