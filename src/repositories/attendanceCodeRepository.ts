import { commonCodeApi } from '@/api/commonCodeApi';
import {
  adaptAttendanceCodeToCommonCodeDto,
  adaptCommonCodeDtoToAttendanceCode,
} from '@/adapters/attendanceCodeAdapter';
import type { AttendanceCode } from '@/types/domain';

export type AttendanceCodeRepository = {
  selectAll: () => Promise<AttendanceCode[]>;
  insert: (code: AttendanceCode) => Promise<void>;
  modify: (code: AttendanceCode) => Promise<void>;
  end: (code: AttendanceCode, effectiveDate: string) => Promise<void>;
};

const attendanceCodeGroupAliases = new Set([
  'ATTENDANCE_CODE',
  'ATTEND_CODE',
  'ATTEND_STAT',
  'ATTE_CODE',
  'ATTE_STATUS',
  'G_ATTE_CODE',
  'G_ATTE_STATUS',
  'G_ATTEND_STAT',
  'G_ATTENDANCE_CODE',
]);

const isAttendanceCodeGroup = (groupCode?: string) =>
  Boolean(groupCode && attendanceCodeGroupAliases.has(groupCode.trim().toUpperCase()));

const apiAttendanceCodeRepository: AttendanceCodeRepository = {
  async selectAll() {
    const codes = await commonCodeApi.selectCodes();
    return codes
      .filter((code) => isAttendanceCodeGroup(code.group_code ?? code.groupCode))
      .map(adaptCommonCodeDtoToAttendanceCode);
  },
  async insert(code) {
    await commonCodeApi.insertCode(adaptAttendanceCodeToCommonCodeDto(code));
  },
  async modify(code) {
    await commonCodeApi.modifyCode(adaptAttendanceCodeToCommonCodeDto(code));
  },
  async end(code, effectiveDate) {
    await commonCodeApi.modifyCode(adaptAttendanceCodeToCommonCodeDto({
      ...code,
      isActive: false,
      endDate: effectiveDate,
    }));
  },
};

export const attendanceCodeRepository = apiAttendanceCodeRepository;
