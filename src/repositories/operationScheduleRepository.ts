import { employeeApi } from '@/api/employeeApi';
import {
  adaptEmployeeAttendDtoToOperationSchedule,
  adaptOperationScheduleToEmployeeAttendDto,
} from '@/adapters/operationScheduleAdapter';
import type { OperationSchedule } from '@/types/domain';
import { isApiDataSource } from './config';

export type OperationScheduleRepository = {
  selectByPeriod: (startDate: string, endDate: string) => Promise<OperationSchedule[]>;
  insertMany: (schedules: OperationSchedule[]) => Promise<void>;
  modify: (schedule: OperationSchedule) => Promise<void>;
};

const mockOperationScheduleRepository: OperationScheduleRepository = {
  async selectByPeriod() {
    return [];
  },
  async insertMany() {},
  async modify() {},
};

const apiOperationScheduleRepository: OperationScheduleRepository = {
  async selectByPeriod(startDate, endDate) {
    const schedules = await employeeApi.selectAttendByItems({
      start_date: startDate,
      end_date: endDate,
    });

    return schedules.map(adaptEmployeeAttendDtoToOperationSchedule);
  },
  async insertMany(schedules) {
    await Promise.all(
      schedules.map((schedule) =>
        employeeApi.insertAttend(adaptOperationScheduleToEmployeeAttendDto(schedule))),
    );
  },
  async modify(schedule) {
    await employeeApi.modifyAttend(adaptOperationScheduleToEmployeeAttendDto(schedule));
  },
};

export const operationScheduleRepository = isApiDataSource
  ? apiOperationScheduleRepository
  : mockOperationScheduleRepository;
