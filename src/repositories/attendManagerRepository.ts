import {
  attendManagerApi,
  type AttendManagerMonthParams,
  type AttendManagerSendMailItem,
  type AttendManagerWeekParams,
} from '@/api/attendManagerApi';
import type {
  AttendManagerConfirmStatusDto,
  AttendManagerShiftScheduleDto,
  AttendManagerSummaryDto,
} from '@/api/dto/attendManager.dto';

export type AttendManagerRepository = {
  getSummary: (params: AttendManagerWeekParams) => Promise<AttendManagerSummaryDto | null>;
  getOperationConfirmStatus: (
    params: AttendManagerWeekParams
  ) => Promise<AttendManagerConfirmStatusDto | null>;
  getOperationConfirmStatusList: (
    params: AttendManagerMonthParams
  ) => Promise<AttendManagerConfirmStatusDto[]>;
  getShiftMonth: (
    params: AttendManagerMonthParams
  ) => Promise<AttendManagerShiftScheduleDto[]>;
  saveShift: (schedules: AttendManagerShiftScheduleDto[]) => Promise<void>;
  modifyShift: (schedule: AttendManagerShiftScheduleDto) => Promise<void>;
  deleteShift: (shiftScheduleId: number | string) => Promise<void>;
  confirmOperationWeek: (params: AttendManagerWeekParams) => Promise<void>;
  cancelOperationWeek: (params: AttendManagerWeekParams) => Promise<void>;
  deleteOperationWeekInfo: (idx: number | string) => Promise<void>;
  sendMail: (items: AttendManagerSendMailItem[]) => Promise<void>;
};

const apiAttendManagerRepository: AttendManagerRepository = {
  getSummary: attendManagerApi.getSummary,
  getOperationConfirmStatus: attendManagerApi.getOperationConfirmStatus,
  getOperationConfirmStatusList: attendManagerApi.getOperationConfirmStatusList,
  getShiftMonth: attendManagerApi.getShiftMonth,
  async saveShift(schedules) {
    await attendManagerApi.saveShift(schedules);
  },
  async modifyShift(schedule) {
    await attendManagerApi.modifyShift(schedule);
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
  async deleteOperationWeekInfo(idx) {
    await attendManagerApi.deleteOperationWeekInfo(idx);
  },
  async sendMail(items) {
    await attendManagerApi.sendMail(items);
  },
};

export const attendManagerRepository = apiAttendManagerRepository;
