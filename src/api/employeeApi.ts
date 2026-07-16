import { apiClient } from './client';
import type {
  EmployeeAttendDto,
  EmployeeAttendItemSelectRequestDto,
  EmployeeAttendListResponseDto,
  EmployeeDto,
  EmployeeListResponseDto,
  EmployeeResponseDto,
} from './dto/employee.dto';

const normalizeAttendSelectPayload = (payload: EmployeeAttendItemSelectRequestDto = {}) => ({
  select_type: payload.select_type ?? payload.selectType ?? '',
  year: payload.year === undefined || payload.year === null ? '' : String(payload.year),
  month: payload.month === undefined || payload.month === null ? '' : String(payload.month),
  week: payload.week === undefined || payload.week === null ? '' : String(payload.week),
});

const normalizeAttendanceItemsPayload = (payload: EmployeeAttendItemSelectRequestDto) => ({
  select_type: payload.select_type ?? payload.selectType ?? '',
  emp_no: payload.emp_no ?? payload.empNo ?? '',
  attend_code: payload.attend_code ?? payload.attendCode ?? payload.detail_code ?? payload.detailCode ?? '',
  year: payload.year === undefined || payload.year === null ? '' : String(payload.year),
  month: payload.month === undefined || payload.month === null ? '' : String(payload.month),
  week: payload.week === undefined || payload.week === null ? '' : String(payload.week),
  start_date: payload.start_date ?? payload.startDate ?? payload.attend_date ?? payload.attendDate ?? '',
  end_date: payload.end_date ?? payload.endDate ?? payload.attend_date ?? payload.attendDate ?? '',
});

const normalizeEmployeePayload = (payload: EmployeeDto): EmployeeDto => ({
  emp_company: payload.emp_company ?? payload.empCompany ?? '',
  emp_no: payload.emp_no ?? payload.empNo ?? '',
  emp_name: payload.emp_name ?? payload.empName ?? payload.name ?? '',
  dept_code: payload.dept_code ?? payload.deptCode ?? '',
  rank_code: payload.rank_code ?? payload.rankCode ?? '',
  work_type_code: payload.work_type_code ?? payload.workTypeCode ?? '',
  hold_stat_code: payload.hold_stat_code ?? payload.holdStatCode ?? '',
  email: payload.email ?? '',
  phone_no: payload.phone_no ?? payload.phoneNo ?? '',
  hire_date: payload.hire_date ?? payload.hireDate ?? '',
  retire_date: payload.retire_date ?? payload.retireDate ?? '',
  reg_date: payload.reg_date ?? payload.regDate ?? '',
  modify_date: payload.modify_date ?? payload.modifyDate ?? '',
  etc: payload.etc ?? '',
});

const normalizeEmployeeAttendPayload = (payload: EmployeeAttendDto): EmployeeAttendDto => ({
  idx: payload.idx ?? payload.id ?? '',
  attend_date: payload.attend_date ?? payload.attendDate ?? '',
  emp_no: payload.emp_no ?? payload.empNo ?? '',
  detail_code: payload.detail_code ?? payload.detailCode ?? payload.attend_code ?? payload.attendCode ?? '',
  attend_reason: payload.attend_reason ?? payload.attendReason ?? payload.attend_name ?? payload.attendName ?? '',
  etc: payload.etc ?? payload.memo ?? payload.remark ?? '',
});

export const employeeApi = {
  insert(payload: EmployeeDto) {
    return apiClient<string>('/api/employee/insert', {
      method: 'POST',
      body: { newemployeeinfo: normalizeEmployeePayload(payload) },
    });
  },

  async selectAll() {
    const response = await apiClient<EmployeeListResponseDto>('/api/employee/select');
    return response.employeelist ?? response.employeeList ?? response.items ?? response.rows ?? response.list ?? response.data ?? [];
  },

  async selectOne(empNo: number | string) {
    const response = await apiClient<EmployeeDto | EmployeeResponseDto>(`/api/employee/select/${empNo}`);
    if ('employee' in response || 'employeeinfo' in response || 'employeeInfo' in response || 'data' in response) {
      return response.employee ?? response.employeeinfo ?? response.employeeInfo ?? response.data ?? null;
    }
    return response;
  },

  modify(payload: EmployeeDto) {
    return apiClient<string>('/api/employee/modify', {
      method: 'POST',
      body: { employeedetailinfo: normalizeEmployeePayload(payload) },
    });
  },

  delete(empNo: number | string) {
    return apiClient<string>(`/api/employee/delete/${empNo}`, {
      method: 'POST',
    });
  },

  insertAttend(payload: EmployeeAttendDto) {
    return apiClient<string>('/api/employee/attend/insert', {
      method: 'POST',
      body: { newattendanceinfo: normalizeEmployeeAttendPayload(payload) },
    });
  },

  async selectAttendAll(payload: EmployeeAttendItemSelectRequestDto = { select_type: '3' }) {
    const response = await apiClient<EmployeeAttendDto[] | EmployeeAttendListResponseDto>('/api/employee/attend/select', {
      method: 'POST',
      body: { attendselectinfo: normalizeAttendSelectPayload(payload) },
    });
    if (Array.isArray(response)) return response;
    return response.attendancelist
      ?? response.attendanceList
      ?? response.employeeattendlist
      ?? response.employeeAttendList
      ?? response.attendlist
      ?? response.attendList
      ?? response.items
      ?? response.rows
      ?? response.list
      ?? response.data
      ?? [];
  },

  async selectAttendByEmployee(empNo: number | string) {
    const response = await apiClient<EmployeeAttendDto[] | EmployeeAttendListResponseDto>(
      `/api/employee/attend/select/emp/${empNo}`,
    );
    if (Array.isArray(response)) return response;
    return response.attendancelist
      ?? response.attendanceList
      ?? response.employeeattendlist
      ?? response.employeeAttendList
      ?? response.attendlist
      ?? response.attendList
      ?? response.items
      ?? response.rows
      ?? response.list
      ?? response.data
      ?? [];
  },

  async selectAttendByItems(payload: EmployeeAttendItemSelectRequestDto) {
    const response = await apiClient<EmployeeAttendDto[] | EmployeeAttendListResponseDto>('/api/employee/attend/select/items', {
      method: 'POST',
      body: { attendanceitems: normalizeAttendanceItemsPayload(payload) },
    });
    if (Array.isArray(response)) return response;
    return response.attendancelist
      ?? response.attendanceList
      ?? response.employeeattendlist
      ?? response.employeeAttendList
      ?? response.attendlist
      ?? response.attendList
      ?? response.items
      ?? response.rows
      ?? response.list
      ?? response.data
      ?? [];
  },

  modifyAttend(payload: EmployeeAttendDto) {
    return apiClient<string>('/api/employee/attend/modify', {
      method: 'POST',
      body: { attendanceinfo: normalizeEmployeeAttendPayload(payload) },
    });
  },

  deleteAttend(idx: number | string) {
    return apiClient<string>(`/api/employee/attend/delete/${idx}`, {
      method: 'POST',
    });
  },
};


