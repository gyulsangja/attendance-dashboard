import { apiClient } from './client';
import type {
  EmployeeAttendDto,
  EmployeeAttendItemSelectRequestDto,
  EmployeeAttendListResponseDto,
  EmployeeDto,
  EmployeeListResponseDto,
  EmployeeResponseDto,
} from './dto/employee.dto';

export const employeeApi = {
  insert(payload: EmployeeDto) {
    return apiClient<string>('/api/employee/insert', {
      method: 'POST',
      body: { newemployeeinfo: payload },
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
      body: { employeeinfo: payload },
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
      body: payload,
    });
  },

  async selectAttendAll() {
    const response = await apiClient<EmployeeAttendDto[] | EmployeeAttendListResponseDto>('/api/employee/attend/select');
    if (Array.isArray(response)) return response;
    return response.employeeattendlist
      ?? response.employeeAttendList
      ?? response.attendlist
      ?? response.attendList
      ?? response.items
      ?? response.rows
      ?? response.list
      ?? response.data
      ?? [];
  },

  selectAttendByEmployee(empNo: number | string) {
    return apiClient<EmployeeAttendDto[]>(`/api/employee/attend/select/emp/${empNo}`);
  },

  async selectAttendByItems(payload: EmployeeAttendItemSelectRequestDto) {
    const response = await apiClient<EmployeeAttendDto[] | EmployeeAttendListResponseDto>('/api/employee/attend/select/items', {
      method: 'POST',
      body: payload,
    });
    if (Array.isArray(response)) return response;
    return response.employeeattendlist
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
      body: payload,
    });
  },

  deleteAttend(empNo: number | string) {
    return apiClient<string>(`/api/employee/attend/delete/${empNo}`, {
      method: 'POST',
    });
  },
};


