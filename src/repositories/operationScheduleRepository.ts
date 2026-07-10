import { employeeApi } from '@/api/employeeApi';
import {
  adaptEmployeeAttendDtoToOperationSchedule,
  adaptOperationScheduleToEmployeeAttendDto,
} from '@/adapters/operationScheduleAdapter';
import type { OperationSchedule } from '@/types/domain';
import { isApiDataSource } from './config';

export type OperationScheduleSaveFailure = {
  schedule: OperationSchedule;
  message: string;
};

export type OperationScheduleSaveResult = {
  totalCount: number;
  successCount: number;
  failureCount: number;
  failures: OperationScheduleSaveFailure[];
};

export type OperationSchedulePeriodParams = {
  year?: number;
  month?: number;
  week?: number;
};

export type OperationScheduleRepository = {
  selectByPeriod: (
    startDate: string,
    endDate: string,
    params?: OperationSchedulePeriodParams,
  ) => Promise<OperationSchedule[]>;
  insertMany: (schedules: OperationSchedule[]) => Promise<OperationScheduleSaveResult>;
  modify: (schedule: OperationSchedule) => Promise<void>;
  delete: (schedule: OperationSchedule) => Promise<void>;
};

const mockOperationScheduleRepository: OperationScheduleRepository = {
  async selectByPeriod() {
    return [];
  },
  async insertMany(schedules) {
    return {
      totalCount: schedules.length,
      successCount: schedules.length,
      failureCount: 0,
      failures: [],
    };
  },
  async modify() {},
  async delete() {},
};

const apiOperationScheduleRepository: OperationScheduleRepository = {
  async selectByPeriod(startDate, endDate, params) {
    const adaptAndFilter = (items: Awaited<ReturnType<typeof employeeApi.selectAttendAll>>) =>
      items
        .map(adaptEmployeeAttendDtoToOperationSchedule)
        .filter((schedule) => schedule.date >= startDate && schedule.date <= endDate);

    if (params?.year && params.month && params.week) {
      try {
        const weeklySchedules = await employeeApi.selectAttendAll({
          select_type: '1',
          year: String(params.year),
          month: String(params.month),
          week: String(params.week),
        });

        return adaptAndFilter(weeklySchedules);
      } catch {
        // Fallback below handles backends where week search is not implemented.
      }

      try {
        const monthlySchedules = await employeeApi.selectAttendAll({
          select_type: '2',
          year: String(params.year),
          month: String(params.month),
        });
        return adaptAndFilter(monthlySchedules);
      } catch {
        // Fallback below handles backends where month search is not implemented.
      }

      try {
        const yearlySchedules = await employeeApi.selectAttendAll({
          select_type: '3',
          year: String(params.year),
        });
        return adaptAndFilter(yearlySchedules);
      } catch {
        // Date range fallback below is the last backend-supported query shape.
      }
    }

    const schedules = await employeeApi.selectAttendByItems({
      select_type: '4',
      start_date: startDate,
      end_date: endDate,
    });

    return adaptAndFilter(schedules);
  },
  async insertMany(schedules) {
    const failures: OperationScheduleSaveFailure[] = [];

    for (const schedule of schedules) {
      try {
        await employeeApi.insertAttend(adaptOperationScheduleToEmployeeAttendDto(schedule));
      } catch (error) {
        failures.push({
          schedule,
          message: error instanceof Error ? error.message : '저장 중 오류가 발생했습니다.',
        });
      }
    }

    return {
      totalCount: schedules.length,
      successCount: schedules.length - failures.length,
      failureCount: failures.length,
      failures,
    };
  },
  async modify(schedule) {
    await employeeApi.modifyAttend(adaptOperationScheduleToEmployeeAttendDto(schedule, { includeId: true }));
  },
  async delete() {
    throw new Error('근태일정 개별 삭제 API가 필요합니다. 현재 Swagger의 /api/employee/attend/delete/{emp_no}는 특정 일정 1건 삭제 기준으로 사용하기 어렵습니다.');
  },
};

export const operationScheduleRepository = isApiDataSource
  ? apiOperationScheduleRepository
  : mockOperationScheduleRepository;
