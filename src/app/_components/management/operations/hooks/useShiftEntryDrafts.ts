'use client';

import { useMemo, useState } from 'react';
import { formatDateKey } from '@/lib/date';
import { SHIFT_STATUS } from '@/lib/management/shiftSchedules';
import type { ShiftSchedule } from '@/types/domain';

export type ShiftPreset = {
  value: string;
  checkIn: string;
  checkOut: string;
  label: string;
};

export const SHIFT_PRESETS: ShiftPreset[] = [
  { value: 'SHIFT_DAY', checkIn: '09:00', checkOut: '18:00', label: '09:00~18:00' },
  { value: 'SHIFT_AFTERNOON', checkIn: '12:00', checkOut: '21:00', label: '12:00~21:00' },
  { value: 'SHIFT_NIGHT', checkIn: '21:00', checkOut: '09:00', label: '21:00~익일 09:00' },
];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatTimeRange = (checkIn: string, checkOut: string) =>
  `${checkIn} ~ ${checkOut <= checkIn ? '익일 ' : ''}${checkOut}`;

type UseShiftEntryDraftsParams = {
  existing: ShiftSchedule[];
  workers: { employeeId: number; name: string }[];
  period: { startDate: string; endDate: string };
};

export function useShiftEntryDrafts({
  existing,
  workers,
  period,
}: UseShiftEntryDraftsParams) {
  const weekDays = useMemo(() => {
    const days: Array<{ date: string; label: string }> = [];
    const end = new Date(`${period.endDate}T00:00:00`);

    for (
      const current = new Date(`${period.startDate}T00:00:00`);
      current <= end;
      current.setDate(current.getDate() + 1)
    ) {
      days.push({
        date: formatDateKey(current),
        label: `${current.getMonth() + 1}/${current.getDate()} (${WEEKDAYS[current.getDay()]})`,
      });
    }
    return days;
  }, [period.endDate, period.startDate]);

  const [workerId, setWorkerId] = useState<string>(
    workers[0] ? String(workers[0].employeeId) : '',
  );
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [shiftType, setShiftType] = useState(SHIFT_PRESETS[0].value);
  const [checkIn, setCheckIn] = useState(SHIFT_PRESETS[0].checkIn);
  const [checkOut, setCheckOut] = useState(SHIFT_PRESETS[0].checkOut);
  const [drafts, setDrafts] = useState<ShiftSchedule[]>([]);
  const selectedWorkerId = workers.some((worker) => String(worker.employeeId) === workerId)
    ? workerId
    : workers[0]
      ? String(workers[0].employeeId)
      : '';

  const applyShiftType = (value: string) => {
    const preset = SHIFT_PRESETS.find((item) => item.value === value);
    if (!preset) return;

    setShiftType(preset.value);
    setCheckIn(preset.checkIn);
    setCheckOut(preset.checkOut);
  };

  const toggleDate = (date: string, checked: boolean) => {
    setSelectedDates((current) =>
      checked
        ? [...current, date].sort()
        : current.filter((item) => item !== date)
    );
  };

  const addDrafts = () => {
    const worker = workers.find((item) => String(item.employeeId) === selectedWorkerId);
    if (!worker || selectedDates.length === 0) return;

    const maxId = Math.max(
      0,
      ...existing.map((item) => item.id),
      ...drafts.map((item) => item.id),
    );
    let nextId = maxId + 1;
    const nextDrafts = selectedDates.sort().map((date) => {
      const existingSchedule = existing.find(
        (item) => item.employeeId === worker.employeeId && item.date === date,
      );
      return {
        id: existingSchedule?.id ?? nextId++,
        date,
        employeeId: worker.employeeId,
        name: worker.name,
        shift: shiftType,
        time: formatTimeRange(checkIn, checkOut),
        checkIn,
        checkOut,
        status: SHIFT_STATUS.PENDING,
      };
    });

    setDrafts((current) => {
      const draftMap = new Map(
        current.map((item) => [`${item.employeeId}-${item.date}`, item]),
      );
      nextDrafts.forEach((item) => draftMap.set(`${item.employeeId}-${item.date}`, item));
      return [...draftMap.values()].sort(
        (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name),
      );
    });
    setSelectedDates([]);
  };

  const removeDraft = (draft: ShiftSchedule) => {
    setDrafts((current) => current.filter(
      (item) => !(item.employeeId === draft.employeeId && item.date === draft.date),
    ));
  };

  return {
    weekDays,
    workerId: selectedWorkerId,
    selectedDates,
    shiftType,
    checkIn,
    checkOut,
    drafts,
    setWorkerId,
    setSelectedDates,
    setCheckIn,
    setCheckOut,
    setDrafts,
    applyShiftType,
    toggleDate,
    addDrafts,
    removeDraft,
  };
}
