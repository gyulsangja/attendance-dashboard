import { attendanceCodes } from '../attendanceCodes';
import { operationSchedules, shiftSchedules } from './operations';

// 이전 요약 컴포넌트 호환용입니다. 운영관리 원본에서 계산합니다.
export const manageReport = {
  list: attendanceCodes.map((code) => ({
    title: code.label,
    count: operationSchedules.filter((schedule) => schedule.codeId === code.id).length,
  })),
  ShiftWork: {
    title: '교대근무 계획',
    result: shiftSchedules.length > 0,
  },
  deviceData: {
    title: '단말기 데이터',
    result: true,
  },
};
