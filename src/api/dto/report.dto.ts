export type WeeklyReportCodeSummaryDto = {
  attendance_code?: string;
  attendanceCode?: string;
  code_id?: string;
  codeId?: string;
  attendance_code_name?: string;
  attendanceCodeName?: string;
  label?: string;
  count?: number | string;
  exceptional?: boolean;
};

export type WeeklyReportRecordDto = {
  emp_no?: number | string;
  empNo?: number | string;
  employee_id?: number | string;
  employeeId?: number | string;
  emp_name?: string;
  empName?: string;
  employee_name?: string;
  employeeName?: string;
  dept_name?: string;
  deptName?: string;
  department?: string;
  work_date?: string;
  workDate?: string;
  date?: string;
  check_in?: string;
  checkIn?: string;
  check_out?: string;
  checkOut?: string;
  attendance_code?: string;
  attendanceCode?: string;
  attendance_code_name?: string;
  attendanceCodeName?: string;
};

export type WeeklyReportTimeColumnDto = {
  date?: string;
  label?: string;
};

export type WeeklyReportTimeCellDto = {
  time?: string;
  codes?: string;
};

export type WeeklyReportTimeRowDto = {
  employee_id?: number | string;
  employeeId?: number | string;
  emp_no?: number | string;
  empNo?: number | string;
  department?: string;
  dept_name?: string;
  deptName?: string;
  employee_name?: string;
  employeeName?: string;
  emp_name?: string;
  empName?: string;
  cells?: Record<string, WeeklyReportTimeCellDto>;
};

export type WeeklyReportDto = {
  title?: string;
  period_label?: string;
  periodLabel?: string;
  week_start_date?: string;
  weekStartDate?: string;
  week_end_date?: string;
  weekEndDate?: string;
  generated_at?: string;
  generatedAt?: string;
  printed_at?: string;
  printedAt?: string;
  attendance_code_summary?: WeeklyReportCodeSummaryDto[];
  attendanceCodeSummary?: WeeklyReportCodeSummaryDto[];
  code_counts?: WeeklyReportCodeSummaryDto[];
  codeCounts?: WeeklyReportCodeSummaryDto[];
  records?: WeeklyReportRecordDto[];
  time_columns?: WeeklyReportTimeColumnDto[];
  timeColumns?: WeeklyReportTimeColumnDto[];
  time_rows?: WeeklyReportTimeRowDto[];
  timeRows?: WeeklyReportTimeRowDto[];
};
