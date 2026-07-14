export type DashboardSummaryCardDto = {
  label?: string;
  count?: number | string;
  value?: number | string;
  attendance_code?: string;
  attendanceCode?: string;
  attendance_code_name?: string;
  attendanceCodeName?: string;
};

export type DashboardAttendanceRecordDto = {
  id?: string | number;
  work_date?: string;
  workDate?: string;
  date?: string;
  emp_no?: string | number;
  empNo?: string | number;
  emp_name?: string;
  empName?: string;
  dept_name?: string;
  deptName?: string;
  department?: string;
  attendance_code?: string;
  attendanceCode?: string;
  attendance_code_name?: string;
  attendanceCodeName?: string;
  detail?: string;
  reason?: string;
};

export type DashboardShiftScheduleDto = {
  shift_schedule_id?: string | number;
  shiftScheduleId?: string | number;
  idx?: string | number;
  work_date?: string;
  workDate?: string;
  date?: string;
  emp_no?: string | number;
  empNo?: string | number;
  emp_name?: string;
  empName?: string;
  shift_type?: string;
  shiftType?: string;
  shift_name?: string;
  shiftName?: string;
  dept_name?: string;
  deptName?: string;
  start_time?: string;
  startTime?: string;
  end_time?: string;
  endTime?: string;
  is_next_day?: boolean | string;
  isNextDay?: boolean | string;
};

export type DashboardOperationProgressItemDto = {
  label?: string;
  value?: string;
  done?: boolean | string;
};

export type DashboardOperationProgressDto = {
  items?: DashboardOperationProgressItemDto[];
  operation_confirmed?: boolean | string;
  operationConfirmed?: boolean | string;
  attendance_schedule_count?: number | string;
  attendanceScheduleCount?: number | string;
  shift_schedule_count?: number | string;
  shiftScheduleCount?: number | string;
  device_record_count?: number | string;
  deviceRecordCount?: number | string;
};

export type DashboardCompanyStatusDto = {
  team_count?: number | string;
  teamCount?: number | string;
  employee_count?: number | string;
  employeeCount?: number | string;
  shift_worker_count?: number | string;
  shiftWorkerCount?: number | string;
  active_attendance_code_count?: number | string;
  activeAttendanceCodeCount?: number | string;
};

export type DashboardAttendanceCodeCountDto = {
  attendance_code?: string;
  attendanceCode?: string;
  attendance_code_name?: string;
  attendanceCodeName?: string;
  count?: number | string;
};

export type DashboardWeeklyDto = {
  year?: number;
  month?: number;
  week?: number;
  week_start_date?: string;
  weekStartDate?: string;
  week_end_date?: string;
  weekEndDate?: string;
  operation_confirmed?: boolean | string;
  operationConfirmed?: boolean | string;
  summary_cards?: DashboardSummaryCardDto[];
  summaryCards?: DashboardSummaryCardDto[];
  exceptional_attendance_records?: DashboardAttendanceRecordDto[];
  exceptionalAttendanceRecords?: DashboardAttendanceRecordDto[];
  weekly_attendance_plans?: DashboardAttendanceRecordDto[];
  weeklyAttendancePlans?: DashboardAttendanceRecordDto[];
  shift_weekly_schedules?: DashboardShiftScheduleDto[];
  shiftWeeklySchedules?: DashboardShiftScheduleDto[];
  operation_progress?: DashboardOperationProgressDto;
  operationProgress?: DashboardOperationProgressDto;
  company_status?: DashboardCompanyStatusDto;
  companyStatus?: DashboardCompanyStatusDto;
  attendance_code_counts?: DashboardAttendanceCodeCountDto[];
  attendanceCodeCounts?: DashboardAttendanceCodeCountDto[];
  attendance_count?: number | string;
  attendanceCount?: number | string;
  lateness_count?: number | string;
  latenessCount?: number | string;
  from_work_count?: number | string;
  fromWorkCount?: number | string;
  shift_count?: number | string;
  shiftCount?: number | string;
  day_off_count?: number | string;
  dayOffCount?: number | string;
  morning_off_count?: number | string;
  morningOffCount?: number | string;
  afternoon_off_count?: number | string;
  afternoonOffCount?: number | string;
  early_leave_count?: number | string;
  earlyLeaveCount?: number | string;
  direct_work_count?: number | string;
  directWorkCount?: number | string;
  direct_leave_count?: number | string;
  directLeaveCount?: number | string;
  data?: DashboardWeeklyDto;
  result?: DashboardWeeklyDto;
  dashboardinfo?: DashboardWeeklyDto;
  dashboardInfo?: DashboardWeeklyDto;
  dashboard?: DashboardWeeklyDto;
  weekly_dashboard?: DashboardWeeklyDto;
  weeklyDashboard?: DashboardWeeklyDto;
};
