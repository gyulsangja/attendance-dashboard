import {
  attendManagerApi,
  type AttendManagerMonthParams,
  type AttendManagerWeekParams,
} from '@/api/attendManagerApi';
import type {
  AttendManagerConfirmStatusDto,
  AttendManagerShiftScheduleDto,
  AttendManagerSummaryDto,
} from '@/api/dto/attendManager.dto';
import { isApiDataSource } from './config';

export type AttendManagerRepository = {
  getSummary: (params: AttendManagerWeekParams) => Promise<AttendManagerSummaryDto | null>;
  getOperationConfirmStatus: (
    params: AttendManagerWeekParams
  ) => Promise<AttendManagerConfirmStatusDto | null>;
  getShiftConfirmStatus: (
    params: AttendManagerWeekParams
  ) => Promise<AttendManagerConfirmStatusDto | null>;
  getShiftMonth: (
    params: AttendManagerMonthParams
  ) => Promise<AttendManagerShiftScheduleDto[]>;
  saveShift: (schedules: AttendManagerShiftScheduleDto[]) => Promise<void>;
  deleteShift: (shiftScheduleId: number | string) => Promise<void>;
  confirmOperationWeek: (params: AttendManagerWeekParams) => Promise<void>;
  cancelOperationWeek: (params: AttendManagerWeekParams) => Promise<void>;
  confirmShiftWeek: (params: AttendManagerWeekParams) => Promise<void>;
  cancelShiftWeek: (params: AttendManagerWeekParams) => Promise<void>;
};

const mockAttendManagerRepository: AttendManagerRepository = {
  async getSummary() {
    return null;
  },
  async getOperationConfirmStatus() {
    return null;
  },
  async getShiftConfirmStatus() {
    return null;
  },
  async getShiftMonth() {
    return [];
  },
  async saveShift() {},
  async deleteShift() {},
  async confirmOperationWeek() {},
  async cancelOperationWeek() {},
  async confirmShiftWeek() {},
  async cancelShiftWeek() {},
};

const apiAttendManagerRepository: AttendManagerRepository = {
  getSummary: attendManagerApi.getSummary,
  getOperationConfirmStatus: attendManagerApi.getOperationConfirmStatus,
  getShiftConfirmStatus: attendManagerApi.getShiftConfirmStatus,
  getShiftMonth: attendManagerApi.getShiftMonth,
  async saveShift(schedules) {
    await attendManagerApi.saveShift(schedules);
  },
  async deleteShift(shiftScheduleId) {
    await attendManagerApi.deleteShift(shiftScheduleId);
  },
  async confirmOperationWeek(params) {
    await attendManagerApi.confirmOperationWeek(params);
  },
  async cancelOperationWeek(params) {
    await attendManagerApi.cancelOperationWeek(params);
  },
  async confirmShiftWeek(params) {
    await attendManagerApi.confirmShiftWeek(params);
  },
  async cancelShiftWeek(params) {
    await attendManagerApi.cancelShiftWeek(params);
  },
};

export const attendManagerRepository = isApiDataSource
  ? apiAttendManagerRepository
  : mockAttendManagerRepository;
