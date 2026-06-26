import { employeeApi } from '@/api/employeeApi';
import {
  adaptEmployeeDtoToOrganizationEmployee,
  adaptEmployeeDtoToReportEmployee,
  adaptOrganizationEmployeeToEmployeeDto,
} from '@/adapters/employeeAdapter';
import { reportEmployees, staffs, shiftWorkers } from '@/mocks';
import type { OrganizationEmployee, ReportEmployee } from '@/types/domain';
import { commonCodeRepository } from './commonCodeRepository';
import { isApiDataSource } from './config';

export type EmployeeRepository = {
  selectAll: () => Promise<ReportEmployee[]>;
  selectOrganizationEmployees: () => Promise<OrganizationEmployee[]>;
  insert: (employee: OrganizationEmployee) => Promise<void>;
  modify: (employee: OrganizationEmployee) => Promise<void>;
  delete: (employee: OrganizationEmployee) => Promise<void>;
};

const shiftWorkerIds = new Set(shiftWorkers.map((worker) => worker.employeeId));
const mockOrganizationEmployees: OrganizationEmployee[] = staffs.flatMap((team) =>
  team.staff.map((employee) => ({
    id: employee.id,
    name: employee.name,
    teamId: team.team,
    position: employee.position,
    jobTitle: employee.jobTitle,
    shiftWorker: shiftWorkerIds.has(employee.id),
    startDate: '2024-01-01',
  })),
);

const mockEmployeeRepository: EmployeeRepository = {
  async selectAll() {
    return reportEmployees.map((employee) => ({ ...employee }));
  },
  async selectOrganizationEmployees() {
    return mockOrganizationEmployees.map((employee) => ({ ...employee }));
  },
  async insert() {},
  async modify() {},
  async delete() {},
};

const apiEmployeeRepository: EmployeeRepository = {
  async selectAll() {
    const [employees, lookup] = await Promise.all([
      employeeApi.selectAll(),
      commonCodeRepository.selectLookup().catch(() => null),
    ]);
    return employees.map((employee) =>
      lookup
        ? adaptEmployeeDtoToReportEmployee(employee, lookup)
        : adaptEmployeeDtoToReportEmployee(employee));
  },
  async selectOrganizationEmployees() {
    const [employees, lookup] = await Promise.all([
      employeeApi.selectAll(),
      commonCodeRepository.selectLookup().catch(() => null),
    ]);
    return employees.map((employee) =>
      lookup
        ? adaptEmployeeDtoToOrganizationEmployee(employee, lookup)
        : adaptEmployeeDtoToOrganizationEmployee(employee));
  },
  async insert(employee) {
    await employeeApi.insert(adaptOrganizationEmployeeToEmployeeDto(employee));
  },
  async modify(employee) {
    await employeeApi.modify(adaptOrganizationEmployeeToEmployeeDto(employee));
  },
  async delete(employee) {
    await employeeApi.delete(employee.id);
  },
};

export const employeeRepository = isApiDataSource
  ? apiEmployeeRepository
  : mockEmployeeRepository;
