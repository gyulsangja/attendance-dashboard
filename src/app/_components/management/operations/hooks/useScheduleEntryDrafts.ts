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

const sortSchedules = (items: OperationSchedule[]) => [...items].sort(
  (a, b) => a.date.localeCompare(b.date)
    || a.department.localeCompare(b.department, 'ko')
    || a.name.localeCompare(b.name, 'ko')
    || a.type.localeCompare(b.type, 'ko'),
);

export function useScheduleEntryDrafts({ existing }: UseScheduleEntryDraftsParams) {
  const codeMaster = useAppSelector((state) => state.attendanceCode);
  const organization = useAppSelector((state) => state.organization);
  const apiEmployeesQuery = useOrganizationEmployeesQuery();
  const apiAttendanceCodesQuery = useAttendanceCodesQuery();
  const [department, setDepartment] = useState('');
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [codeId, setCodeId] = useState('');
  const [dateDraft, setDateDraft] = useState('');
  const [drafts, setDrafts] = useState<OperationSchedule[]>([]);
  const referenceDate = dateDraft;
  const attendanceCodes = (isApiDataSource
    ? apiAttendanceCodesQuery.data ?? []
    : getAttendanceCodesAtDate(
      codeMaster.codes,
      codeMaster.history,
      referenceDate,
    )
  ).filter((code) => code.isActive && (!isApiDataSource || code.groupCode !== 'G_ATTE_STATUS'));

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
        department: employee.backendDeptName ?? employee.teamId ?? UNASSIGNED_TEAM_NAME,
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

  const departments = [...new Set(reportEmployees.map((item) => item.department))]
    .sort((a, b) => a.localeCompare(b, 'ko'));
  const selectedDepartment = department && departments.includes(department)
    ? department
    : '';
  const visibleEmployees = selectedDepartment
    ? reportEmployees.filter((item) => item.department === selectedDepartment)
    : reportEmployees;
  const selectedEmployees = reportEmployees.filter((item) =>
    employeeIds.includes(String(item.id)));
  const code = attendanceCodes.find((item) => item.id === effectiveCodeId);

  const selectVisibleEmployees = () => {
    setEmployeeIds((current) => [
      ...new Set([
        ...current,
        ...visibleEmployees.map((item) => String(item.id)),
      ]),
    ]);
  };

  const clearVisibleEmployees = () => {
    setEmployeeIds((current) => current.filter(
      (id) => !visibleEmployees.some((item) => String(item.id) === id),
    ));
  };

  const setVisibleSelection = (values: string[]) => {
    const others = employeeIds.filter(
      (id) => !visibleEmployees.some((item) => String(item.id) === id),
    );
    setEmployeeIds([...others, ...values]);
  };

  const addDrafts = () => {
    if (!code || selectedEmployees.length === 0 || !dateDraft) return;

    const existingKeys = new Set(existing.map((item) => item.employeeId + '-' + item.date + '-' + item.codeId));
    const draftMap = new Map(drafts.map((item) => [item.employeeId + '-' + item.date + '-' + item.codeId, item]));
    let nextId = Math.max(0, ...existing.map((item) => item.id), ...drafts.map((item) => item.id)) + 1;

    selectedEmployees.forEach((employee) => {
      const key = employee.id + '-' + dateDraft + '-' + code.id;
      if (existingKeys.has(key)) return;
      draftMap.set(key, {
        id: nextId++,
        date: dateDraft,
        department: employee.department,
        employeeId: employee.id,
        employeeNo: employee.employeeNo,
        name: employee.name,
        codeId: code.id,
        type: code.label,
        detail: code.label + ' 입력',
      });
    });

    setDrafts(sortSchedules([...draftMap.values()]));
    setEmployeeIds([]);
    setDateDraft('');
  };

  const removeDraft = (draft: OperationSchedule) => {
    setDrafts((current) => current.filter(
      (item) => !(item.employeeId === draft.employeeId && item.date === draft.date && item.codeId === draft.codeId),
    ));
  };

  const reset = () => {
    setDepartment('');
    setEmployeeIds([]);
    setCodeId('');
    setDateDraft('');
    setDrafts([]);
  };

  return {
    department: selectedDepartment,
    employeeIds,
    codeId: effectiveCodeId,
    dateDraft,
    drafts,
    attendanceCodes,
    departments,
    visibleEmployees,
    code,
    isLoading: isApiDataSource && (apiEmployeesQuery.isLoading || apiAttendanceCodesQuery.isLoading),
    isError: isApiDataSource && (apiEmployeesQuery.isError || apiAttendanceCodesQuery.isError),
    setDepartment,
    setCodeId,
    setDateDraft,
    selectVisibleEmployees,
    clearVisibleEmployees,
    setVisibleSelection,
    addDrafts,
    removeDraft,
    reset,
  };
}
