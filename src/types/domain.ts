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
  groupCode?: 'G_ATTE_CODE' | 'G_ATTE_STATUS' | string;
  isActive: boolean;
  isExceptional: boolean;
  startDate: string;
  endDate?: string;
  sortOrder?: number;
  etc?: string;
};

export type WorkTimePolicy = {
  regularStart: string;
  regularEnd: string;
  halfAmStart: string;
  halfAmEnd: string;
  halfPmStart: string;
  halfPmEnd: string;
  earlyLeaveTime: string;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
};

export type HolidayType = 'PUBLIC' | 'SUBSTITUTE' | 'TEMPORARY' | 'ELECTION' | 'COMPANY';

export type Holiday = {
  id: string;
  date: string;
  name: string;
  type: HolidayType;
  isActive: boolean;
  etc?: string;
};

export type MailMessage = {
  id: string;
  attendCode: string;
  detailCode?: string;
  message: string;
  etc?: string;
  regDate?: string;
};

export type ReportEmployee = {
  id: number;
  employeeNo?: string;
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
  year?: number;
  month?: number;
  week?: number;
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
  employeeNo?: string;
  name: string;
  codeId: string;
  type: string;
  detail: string;
};

export type ShiftScheduleStatus = '승인대기' | '검토완료';

export type ShiftSchedule = {
  id: number;
  date: string;
  employeeId: number;
  employeeNo?: string;
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
  employeeNo?: string;
  empCompany?: string;
  name: string;
  email?: string;
  phoneNo?: string;
  teamId: string;
  position: string;
  jobTitle: string;
  shiftWorker: boolean;
  startDate: string;
  endDate?: string;
  backendRegDate?: string;
  backendModifyDate?: string;
  backendDeptCode?: string;
  backendDeptName?: string;
  backendRankCode?: string;
  backendRankName?: string;
  backendWorkTypeCode?: string;
  backendWorkTypeName?: string;
  backendHoldStatusCode?: string;
  backendHoldStatusName?: string;
  etc?: string;
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
