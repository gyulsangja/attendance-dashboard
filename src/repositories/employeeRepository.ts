import { employeeApi } from '@/api/employeeApi';
import {
  adaptEmployeeDtoToOrganizationEmployee,
  adaptEmployeeDtoToReportEmployee,
  adaptOrganizationEmployeeToEmployeeDto,
} from '@/adapters/employeeAdapter';
import type { OrganizationEmployee, ReportEmployee } from '@/types/domain';
import { commonCodeRepository } from './commonCodeRepository';

export type EmployeeRepository = {
  selectAll: () => Promise<ReportEmployee[]>;
  selectOrganizationEmployees: () => Promise<OrganizationEmployee[]>;
  insert: (employee: OrganizationEmployee) => Promise<void>;
  modify: (employee: OrganizationEmployee) => Promise<void>;
  delete: (employee: OrganizationEmployee) => Promise<void>;
};

const apiEmployeeRepository: EmployeeRepository = {
  async selectAll() {
    const [employees, lookup] = await Promise.all([
      employeeApi.selectAll(),
      commonCodeRepository.selectLookup().catch(() => null),
    ]);
    return employees.map((employee, index) =>
      lookup
        ? adaptEmployeeDtoToReportEmployee(employee, lookup, index)
        : adaptEmployeeDtoToReportEmployee(employee, undefined, index));
  },
  async selectOrganizationEmployees() {
    const [employees, lookup] = await Promise.all([
      employeeApi.selectAll(),
      commonCodeRepository.selectLookup().catch(() => null),
    ]);
    return employees.map((employee, index) =>
      lookup
        ? adaptEmployeeDtoToOrganizationEmployee(employee, lookup, index)
        : adaptEmployeeDtoToOrganizationEmployee(employee, undefined, index));
  },
  async insert(employee) {
    await employeeApi.insert(adaptOrganizationEmployeeToEmployeeDto(employee));
  },
  async modify(employee) {
    await employeeApi.modify(adaptOrganizationEmployeeToEmployeeDto(employee));
  },
  async delete(employee) {
    await employeeApi.delete(employee.employeeNo ?? employee.id);
  },
};

export const employeeRepository = apiEmployeeRepository;
