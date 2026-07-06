'use client';

import { useMemo, useState } from 'react';
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import { useOrganizationEmployeesQuery } from '@/hooks/useEmployeeQueries';
import {
  selectOperationWeekDays,
  selectSelectedOperationWeek,
} from '@/selectors/managementSelectors';
import { isApiDataSource } from '@/repositories/config';
import { useAppSelector } from '@/store/hooks';
import { getAttendanceCodesAtDate } from '@/store/slices/attendanceCodeSlice';
import {
  getOrganizationSnapshot,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';
import type { OperationSchedule } from '@/types/domain';

type UseScheduleEntryDraftsParams = {
  existing: OperationSchedule[];
};

export type ScheduleEntryEmployee = {
  id: number;
  name: string;
  position: string;
  department: string;
};

export function useScheduleEntryDrafts({ existing }: UseScheduleEntryDraftsParams) {
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const week = useAppSelector(selectSelectedOperationWeek);
  const weekDays = useAppSelector(selectOperationWeekDays);
  const apiEmployeesQuery = useOrganizationEmployeesQuery();
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const [department, setDepartment] = useState('');
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [codeId, setCodeId] = useState('');
  const [dates, setDates] = useState<string[]>(() => [weekDays[0]?.date ?? week.startDate]);
  const [dateDraft, setDateDraft] = useState(() => weekDays[1]?.date ?? week.startDate);
  const referenceDate = dates[0] ?? dateDraft;
  const sourceCodes = isApiDataSource ? apiAttendanceCodesQuery.data ?? [] : codeMaster.codes;
  const sourceHistory = isApiDataSource ? [] : codeMaster.history;

  const attendanceCodes = getAttendanceCodesAtDate(
    sourceCodes,
    sourceHistory,
    referenceDate,
  ).filter((code) => code.isSchedulable);

  const reportEmployees = useMemo(() => {
    if (isApiDataSource) {
      return (apiEmployeesQuery.data ?? []).map<ScheduleEntryEmployee>((employee) => ({
        id: employee.id,
        name: employee.name,
        position: employee.backendRankName ?? employee.position,
        department: employee.backendDeptName ?? employee.teamId,
      }));
    }

    const organizationSnapshot = getOrganizationSnapshot(
      organization.teams,
      organization.employees,
      organization.history,
      referenceDate,
    );

    return organizationSnapshot.employees.map<ScheduleEntryEmployee>((employee) => ({
      id: employee.id,
      name: employee.name,
      position: employee.position,
      department: employee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : organizationSnapshot.teams.find((team) => team.id === employee.teamId)?.name ?? '-',
    }));
  }, [
    apiEmployeesQuery.data,
    organization.employees,
    organization.history,
    organization.teams,
    referenceDate,
  ]);

  const departments = [...new Set(reportEmployees.map((item) => item.department))];
  const selectedDepartment = department && departments.includes(department)
    ? department
    : departments[0] ?? '';
  const departmentEmployees = reportEmployees.filter((item) => item.department === selectedDepartment);
  const selectedEmployees = reportEmployees.filter((item) =>
    employeeIds.includes(String(item.id)));
  const code = attendanceCodes.find((item) => item.id === codeId);
  const preview = selectedEmployees.flatMap((employee) =>
    dates.map((date) => ({ employee, date })));

  const selectDepartmentEmployees = () => {
    setEmployeeIds((current) => [
      ...new Set([
        ...current,
        ...departmentEmployees.map((item) => String(item.id)),
      ]),
    ]);
  };

  const setDepartmentSelection = (values: string[]) => {
    const others = employeeIds.filter(
      (id) => !departmentEmployees.some((item) => String(item.id) === id),
    );
    setEmployeeIds([...others, ...values]);
  };

  const addDate = () => {
    setDates((current) =>
      current.includes(dateDraft) ? current : [...current, dateDraft].sort());
  };

  const removeDate = (date: string) => {
    setDates((current) => current.filter((item) => item !== date));
  };

  const buildSchedules = () => {
    if (!code) return [];

    let nextId = Math.max(0, ...existing.map((item) => item.id)) + 1;
    return selectedEmployees.flatMap((employee) =>
      dates
        .filter(
          (date) =>
            !existing.some(
              (item) =>
                item.employeeId === employee.id
                && item.date === date
                && item.codeId === code.id,
            ),
        )
        .map((date) => ({
          id: nextId++,
          date,
          department: employee.department,
          employeeId: employee.id,
          name: employee.name,
          codeId: code.id,
          type: code.label,
          detail: `${code.label} 입력`,
        })),
    );
  };

  return {
    department: selectedDepartment,
    employeeIds,
    codeId,
    dates,
    dateDraft,
    attendanceCodes,
    departments,
    departmentEmployees,
    code,
    preview,
    isLoading: isApiDataSource && (apiEmployeesQuery.isLoading || apiAttendanceCodesQuery.isLoading),
    isError: isApiDataSource && (apiEmployeesQuery.isError || apiAttendanceCodesQuery.isError),
    setDepartment,
    setCodeId,
    setDateDraft,
    selectDepartmentEmployees,
    setDepartmentSelection,
    addDate,
    removeDate,
    buildSchedules,
  };
}
