export const queryKeys = {
  attendanceCodes: ['attendance-codes'] as const,
  dashboardWeekly: (year: number, month: number, week: number) =>
    ['dashboard-weekly', year, month, week] as const,
  dashboardBlock: (block: string, year: number, month: number, week: number) =>
    ['dashboard-block', block, year, month, week] as const,
  attendManagerSummary: (year: number, month: number, week: number) =>
    ['attend-manager-summary', year, month, week] as const,
  attendManagerOperationConfirmStatus: (year: number, month: number, week: number) =>
    ['attend-manager-operation-confirm-status', year, month, week] as const,
  attendManagerShiftMonth: (year: number, month: number, week: number) =>
    ['attend-manager-shift-month', year, month, week] as const,
  statisticsAttendance: (
    periodType: string,
    year: number,
    month?: number,
    week?: number,
  ) => ['statistics-attendance', periodType, year, month, week] as const,
  statisticsEmployeeAttendance: (
    empNo: number | string,
    periodType: string,
    year: number,
    month?: number,
    week?: number,
  ) => ['statistics-employee-attendance', empNo, periodType, year, month, week] as const,
  statisticsMonthlyAttendanceRecords: (year: number, month: number) =>
    ['statistics-attendance-records-monthly', year, month] as const,
  weeklyReport: (year: number, month: number, week: number) =>
    ['weekly-report', year, month, week] as const,
  attendanceRecordsBase: ['attendance-records'] as const,
  attendanceRecords: (week: string) => ['attendance-records', week] as const,
  operationSchedules: (
    startDate: string,
    endDate: string,
    year?: number,
    month?: number,
    week?: number,
  ) => ['operation-schedules', startDate, endDate, year, month, week] as const,
  commonCodes: ['common-codes'] as const,
  commonGroups: ['common-groups'] as const,
  employees: ['employees'] as const,
  organizationEmployees: ['organization-employees'] as const,
  workTimePolicy: ['work-time-policy'] as const,
  users: ['users'] as const,
  holidays: (year: number) => ['holidays', year] as const,
};

