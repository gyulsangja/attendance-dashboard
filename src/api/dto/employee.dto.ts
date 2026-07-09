export type EmployeeDto = {
  id?: number | string;
  idx?: number | string;
  emp_company?: string;
  empCompany?: string;
  emp_no?: number | string;
  empNo?: number | string;
  emp_name?: string;
  empName?: string;
  name?: string;
  dept_code?: string;
  deptCode?: string;
  dept_name?: string;
  deptName?: string;
  department?: string;
  rank_code?: string;
  rankCode?: string;
  rank_name?: string;
  rankName?: string;
  position?: string;
  work_type_code?: string;
  workTypeCode?: string;
  work_type_name?: string;
  workTypeName?: string;
  hold_stat_code?: string;
  holdStatCode?: string;
  hold_stat_name?: string;
  holdStatName?: string;
  email?: string;
  phone_no?: string;
  phoneNo?: string;
  job_title?: string;
  jobTitle?: string;
  use_yn?: string;
  useYn?: string;
  hire_date?: string;
  hireDate?: string;
  retire_date?: string;
  retireDate?: string;
  shift_yn?: string;
  shiftYn?: string;
  etc?: string;
};

export type EmployeeListResponseDto = {
  employeelist?: EmployeeDto[];
  employeeList?: EmployeeDto[];
  items?: EmployeeDto[];
  rows?: EmployeeDto[];
  list?: EmployeeDto[];
  data?: EmployeeDto[];
  totalCount?: number | string;
  total_count?: number | string;
};

export type EmployeeResponseDto = {
  employee?: EmployeeDto;
  employeeinfo?: EmployeeDto;
  employeeInfo?: EmployeeDto;
  data?: EmployeeDto;
};

export type EmployeeAttendDto = {
  id?: number | string;
  idx?: number | string;
  emp_no?: number | string;
  empNo?: number | string;
  emp_name?: string;
  empName?: string;
  dept_code?: string;
  deptCode?: string;
  dept_name?: string;
  deptName?: string;
  rank_code?: string;
  rankCode?: string;
  rank_name?: string;
  rankName?: string;
  attend_code?: string;
  attendCode?: string;
  attend_name?: string;
  attendName?: string;
  attend_code_name?: string;
  attendCodeName?: string;
  detail_code?: string;
  detailCode?: string;
  detail_code_name?: string;
  detailCodeName?: string;
  attend_reason?: string;
  attendReason?: string;
  attend_date?: string;
  attendDate?: string;
  start_time?: string;
  startTime?: string;
  end_time?: string;
  endTime?: string;
  remark?: string;
  memo?: string;
};



export type EmployeeAttendItemSelectRequestDto = {
  select_type?: string;
  selectType?: string;
  year?: number | string;
  month?: number | string;
  week?: number | string;
  emp_no?: number | string;
  empNo?: number | string;
  attend_date?: string;
  attendDate?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  dept_code?: string;
  deptCode?: string;
  detail_code?: string;
  detailCode?: string;
  attend_code?: string;
  attendCode?: string;
};

export type EmployeeAttendListResponseDto = {
  employeeattendlist?: EmployeeAttendDto[];
  employeeAttendList?: EmployeeAttendDto[];
  attendlist?: EmployeeAttendDto[];
  attendList?: EmployeeAttendDto[];
  items?: EmployeeAttendDto[];
  rows?: EmployeeAttendDto[];
  list?: EmployeeAttendDto[];
  data?: EmployeeAttendDto[];
  totalCount?: number | string;
  total_count?: number | string;
};
