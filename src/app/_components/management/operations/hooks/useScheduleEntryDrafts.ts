'use client';

import { useMemo, useState } from 'react';
import { useAttendanceCodesQuery } from '@/hooks/useAttendanceCodeQueries';
import { useOrganizationEmployeesQuery } from '@/hooks/useEmployeeQueries';
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
  employeeNo?: string;
  name: string;
  position: string;
  department: string;
};

const getApiEmployeeSelectId = (employee: { id: number; employeeNo?: string }) => {
  const employeeNo = Number(employee.employeeNo);
  return Number.isFinite(employeeNo) && employeeNo > 0 ? employeeNo : employee.id;
};

export function useScheduleEntryDrafts({ existing }: UseScheduleEntryDraftsParams) {
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const apiEmployeesQuery = useOrganizationEmployeesQuery();
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const [department, setDepartment] = useState('');
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [codeId, setCodeId] = useState('');
  const [dates, setDates] = useState<string[]>([]);
  const [dateDraft, setDateDraft] = useState('');
  const referenceDate = dates[0] ?? dateDraft;
  const attendanceCodes = (isApiDataSource
    ? apiAttendanceCodesQuery.data ?? []
    : getAttendanceCodesAtDate(
      codeMaster.codes,
      codeMaster.history,
      referenceDate,
    )
  ).filter((code) => code.isActive);

  const effectiveCodeId = attendanceCodes.some((code) => code.id === codeId)
    ? codeId
    : '';

  const reportEmployees = useMemo(() => {
    if (isApiDataSource) {
      return (apiEmployeesQuery.data ?? []).map<ScheduleEntryEmployee>((employee) => ({
        id: getApiEmployeeSelectId(employee),
        employeeNo: employee.employeeNo,
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
    : '';
  const departmentEmployees = reportEmployees.filter((item) => item.department === selectedDepartment);
  const selectedEmployees = reportEmployees.filter((item) =>
    employeeIds.includes(String(item.id)));
  const code = attendanceCodes.find((item) => item.id === effectiveCodeId);
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
    if (!dateDraft) return;
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
          employeeNo: employee.employeeNo,
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
    codeId: effectiveCodeId,
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
