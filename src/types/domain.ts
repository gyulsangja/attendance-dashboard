export type UserRole =
  | 'ADMIN'
  | 'EXECUTIVE'
  | 'SHIFT_MANAGER'
  | 'ORGANIZATION_MANAGER'
  | 'GENERAL';

export type RoleAccess = {
  id: UserRole;
  label: string;
  description: string;
  canViewDashboard: boolean;
  canViewReports: boolean;
  canManageOperations: boolean;
  canManageOrganization: boolean;
  canManageSettings: boolean;
  canInputShifts: boolean;
  canApproveShifts: boolean;
  canManageUsers: boolean;
};

export type SystemUser = {
  id: number;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  empNo?: string;
  backendRoleCode?: string;
  backendRoleName?: string;
};

export type AttendanceCode = {
  id: string;
  label: string;
  isActive: boolean;
  isSchedulable: boolean;
  isExceptional: boolean;
  startDate: string;
  endDate?: string;
};

export type WorkTimePolicy = {
  regularStart: string;
  regularEnd: string;
  halfAmStart: string;
  halfAmEnd: string;
  halfPmStart: string;
  halfPmEnd: string;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
};

export type ReportEmployee = {
  id: number;
  name: string;
  department: string;
  position: string;
  shiftWorker?: boolean;
};

export type AttendanceEvent = {
  codeId: string;
  detail: string;
};

export type AttendanceRecord = {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  position: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  events: AttendanceEvent[];
  memo?: string;
  isHoliday?: boolean;
  holidayName?: string;
  isShiftWorker?: boolean;
};

export type DeviceUploadSummary = {
  fileName: string;
  uploadedAt: string;
  startDate: string;
  endDate: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  absenceRows: number;
  errors: string[];
};

export type OperationSchedule = {
  id: number;
  date: string;
  department: string;
  employeeId: number;
  name: string;
  codeId: string;
  type: string;
  detail: string;
};

export type ShiftScheduleStatus = '승인대기' | '확정';

export type ShiftSchedule = {
  id: number;
  date: string;
  employeeId: number;
  name: string;
  shift: string;
  time: string;
  status: ShiftScheduleStatus;
  checkIn?: string;
  checkOut?: string;
};

export type OrganizationTeam = {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
};

export type OrganizationEmployee = {
  id: number;
  name: string;
  teamId: string;
  position: string;
  jobTitle: string;
  shiftWorker: boolean;
  startDate: string;
  endDate?: string;
  backendDeptCode?: string;
  backendDeptName?: string;
  backendRankCode?: string;
  backendRankName?: string;
  backendWorkTypeCode?: string;
  backendWorkTypeName?: string;
  backendHoldStatusCode?: string;
  backendHoldStatusName?: string;
};

export type OrganizationHistory = {
  id: string;
  effectiveDate: string;
  category: '조직' | '구성원';
  targetName: string;
  changeType: string;
  detail: string;
  entityId?: string;
  beforeTeam?: OrganizationTeam;
  beforeEmployee?: OrganizationEmployee;
};
