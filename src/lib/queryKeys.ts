export const queryKeys = {
  attendanceCodes: ['attendance-codes'] as const,
  attendanceRecordsBase: ['attendance-records'] as const,
  attendanceRecords: (week: string) => ['attendance-records', week] as const,
  operationSchedules: (startDate: string, endDate: string) =>
    ['operation-schedules', startDate, endDate] as const,
  commonCodes: ['common-codes'] as const,
  commonGroups: ['common-groups'] as const,
  employees: ['employees'] as const,
  organizationEmployees: ['organization-employees'] as const,
  workTimePolicy: ['work-time-policy'] as const,
  users: ['users'] as const,
};
