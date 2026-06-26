export type EmployeeDto = {
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
  position?: string;
  work_type_code?: string;
  workTypeCode?: string;
  hold_stat_code?: string;
  holdStatCode?: string;
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
  list?: EmployeeDto[];
  data?: EmployeeDto[];
};

export type EmployeeResponseDto = {
  employee?: EmployeeDto;
  employeeinfo?: EmployeeDto;
  employeeInfo?: EmployeeDto;
  data?: EmployeeDto;
};

export type EmployeeAttendDto = {
  emp_no?: number | string;
  empNo?: number | string;
  attend_code?: string;
  attendCode?: string;
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
  list?: EmployeeAttendDto[];
  data?: EmployeeAttendDto[];
};
