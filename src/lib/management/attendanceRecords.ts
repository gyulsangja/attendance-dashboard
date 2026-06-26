import type {
  AttendanceEvent,
  AttendanceRecord,
  OperationSchedule,
  ReportEmployee,
} from '@/types/domain';
import {
  cloneAttendanceRecord,
  isDateInPeriod,
  type OperationWeekPeriod,
} from '@/lib/management/operationWeek';

export const AUTOMATIC_ATTENDANCE_CODE_IDS = new Set(['LATE', 'EARLY_LEAVE', 'ABSENT']);

type DeviceRecordSavePayload = {
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut: string;
  employeeName?: string;
  department?: string;
  position?: string;
  events?: AttendanceEvent[];
};

const getNextRecordId = (records: AttendanceRecord[]) =>
  Math.max(0, ...records.map((record) => record.id)) + 1;

const isSameEmployeeDate = (
  record: Pick<AttendanceRecord, 'employeeId' | 'date'>,
  employeeId: number,
  date: string,
) => record.employeeId === employeeId && record.date === date;

export const addScheduleEventToRecords = (
  records: AttendanceRecord[],
  schedule: OperationSchedule,
  position = '-',
) => {
  const existing = records.find(
    (record) => isSameEmployeeDate(record, schedule.employeeId, schedule.date),
  );

  if (existing) {
    if (existing.events.some((event) => event.codeId === schedule.codeId)) {
      return records;
    }

    return records.map((record) =>
      isSameEmployeeDate(record, schedule.employeeId, schedule.date)
        ? {
          ...record,
          events: [
            ...record.events,
            { codeId: schedule.codeId, detail: schedule.detail },
          ],
        }
        : record,
    );
  }

  return [
    ...records,
    {
      id: getNextRecordId(records),
      employeeId: schedule.employeeId,
      employeeName: schedule.name,
      department: schedule.department,
      position,
      date: schedule.date,
      events: [{ codeId: schedule.codeId, detail: schedule.detail }],
    },
  ];
};

export const removeScheduleEventFromRecords = (
  records: AttendanceRecord[],
  schedule: OperationSchedule,
) => records
  .map((record) => {
    if (!isSameEmployeeDate(record, schedule.employeeId, schedule.date)) {
      return record;
    }

    return {
      ...record,
      events: record.events.filter((event) => event.codeId !== schedule.codeId),
    };
  })
  .filter((record) =>
    Boolean(record.checkIn || record.checkOut || record.events.length > 0),
  );

export const mergeUploadedDeviceRecords = (
  currentRecords: AttendanceRecord[],
  uploadedRecords: AttendanceRecord[],
  period: Pick<OperationWeekPeriod, 'startDate' | 'endDate'>,
) => {
  const clearedRecords = currentRecords
    .map((record) => {
      if (!isDateInPeriod(record.date, period)) {
        return record;
      }

      return {
        ...record,
        checkIn: undefined,
        checkOut: undefined,
        events: record.events.filter(
          (event) => !AUTOMATIC_ATTENDANCE_CODE_IDS.has(event.codeId),
        ),
      };
    })
    .filter((record) =>
      !isDateInPeriod(record.date, period) || record.events.length > 0,
    );

  return uploadedRecords.reduce<AttendanceRecord[]>((result, uploadedRecord) => {
    const index = result.findIndex(
      (record) => isSameEmployeeDate(record, uploadedRecord.employeeId, uploadedRecord.date),
    );
    const nextRecord = cloneAttendanceRecord(uploadedRecord);

    if (index < 0) {
      return [...result, nextRecord];
    }

    return result.map((record, recordIndex) =>
      recordIndex === index
        ? {
          ...record,
          checkIn: nextRecord.checkIn,
          checkOut: nextRecord.checkOut,
          employeeName: nextRecord.employeeName,
          department: nextRecord.department,
          position: nextRecord.position,
          events: [...record.events, ...nextRecord.events],
        }
        : record,
    );
  }, clearedRecords);
};

export const saveDeviceRecordToRecords = (
  records: AttendanceRecord[],
  payload: DeviceRecordSavePayload,
  employee?: ReportEmployee,
) => {
  const index = records.findIndex(
    (record) => isSameEmployeeDate(record, payload.employeeId, payload.date),
  );
  const nextRecord: AttendanceRecord = {
    id: index >= 0 ? records[index].id : getNextRecordId(records),
    employeeId: payload.employeeId,
    employeeName: payload.employeeName ?? employee?.name ?? '-',
    department: payload.department ?? employee?.department ?? '-',
    position: payload.position ?? employee?.position ?? '-',
    date: payload.date,
    checkIn: payload.checkIn || undefined,
    checkOut: payload.checkOut || undefined,
    events: (payload.events ?? []).map((event) => ({ ...event })),
  };

  if (index < 0) {
    return [...records, nextRecord];
  }

  return records.map((record, recordIndex) =>
    recordIndex === index ? nextRecord : record,
  );
};

export const deleteDeviceRecordTimes = (
  records: AttendanceRecord[],
  employeeId: number,
  date: string,
) => records
  .map((record) => {
    if (!isSameEmployeeDate(record, employeeId, date)) {
      return record;
    }

    if (record.events.length > 0) {
      return {
        ...record,
        checkIn: undefined,
        checkOut: undefined,
      };
    }

    return null;
  })
  .filter((record): record is AttendanceRecord => Boolean(record));
