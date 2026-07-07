'use client';

import { useMemo, useState } from 'react';
import {
  useDeleteEmployeeMutation,
  useInsertEmployeeMutation,
  useModifyEmployeeMutation,
  useOrganizationEmployeesQuery,
} from '@/hooks/useEmployeeQueries';
import { isApiDataSource } from '@/repositories/config';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addEmployee,
  addTeam,
  deleteEmployee,
  deleteTeam,
  getOrganizationSnapshot,
  updateEmployee,
  updateTeam,
  type OrganizationEmployee,
  type OrganizationTeam,
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
} from '@/store/slices/organizationSlice';

const today = () => new Date().toISOString().slice(0, 10);

export function useOrganizationManagement() {
  const dispatch = useAppDispatch();
  const { teams, employees, history } = useAppSelector((state) => state.organization);
  const organizationEmployeesQuery = useOrganizationEmployeesQuery();
  const insertEmployeeMutation = useInsertEmployeeMutation();
  const modifyEmployeeMutation = useModifyEmployeeMutation();
  const deleteEmployeeMutation = useDeleteEmployeeMutation();
  const [asOfDate, setAsOfDate] = useState(today);
  const [tab, setTab] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  const [search, setSearch] = useState('');
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<OrganizationEmployee | null>(null);
  const [teamOpen, setTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<OrganizationTeam | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamEffectiveDate, setTeamEffectiveDate] = useState(today);

  const sourceEmployees = useMemo(
    () => (isApiDataSource ? organizationEmployeesQuery.data ?? [] : employees),
    [organizationEmployeesQuery.data, employees],
  );
  const sourceTeams = useMemo(() => {
    if (!isApiDataSource) return teams;

    const teamMap = new Map<string, OrganizationTeam>();
    sourceEmployees.forEach((employee) => {
      if (teamMap.has(employee.teamId)) return;
      teamMap.set(employee.teamId, {
        id: employee.teamId,
        name: employee.backendDeptName ?? employee.teamId,
        startDate: employee.startDate,
      });
    });
    return [...teamMap.values()];
  }, [sourceEmployees, teams]);
  const sourceHistory = useMemo(
    () => (isApiDataSource ? [] : history),
    [history],
  );

  const snapshot = useMemo(
    () => getOrganizationSnapshot(sourceTeams, sourceEmployees, sourceHistory, asOfDate),
    [sourceTeams, sourceEmployees, sourceHistory, asOfDate],
  );
  const { teams: snapshotTeams, employees: snapshotEmployees } = snapshot;

  const visibleEmployees = useMemo(
    () => snapshotEmployees.filter((employee) => {
      const matchesTeam = selectedTeamId === 'all' || employee.teamId === selectedTeamId;
      const keyword = search.trim().toLowerCase();
      const currentTeamName = employee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : snapshotTeams.find((team) => team.id === employee.teamId)?.name ?? '';
      const matchesSearch = !keyword || [employee.name, employee.email ?? '', employee.phoneNo ?? '', employee.position, employee.jobTitle, currentTeamName]
        .some((value) => value.toLowerCase().includes(keyword));
      return matchesTeam && matchesSearch;
    }),
    [snapshotEmployees, snapshotTeams, selectedTeamId, search],
  );

  const setOrganizationDate = (date: string) => {
    setAsOfDate(date);
    setSelectedTeamId('all');
  };

  const openNewEmployee = () => {
    setEditingEmployee(null);
    setEmployeeOpen(true);
  };

  const openEditEmployee = (employee: OrganizationEmployee) => {
    setEditingEmployee(employee);
    setEmployeeOpen(true);
  };

  const saveEmployee = (employee: OrganizationEmployee, effectiveDate: string) => {
    if (isApiDataSource) {
      const mutation = editingEmployee ? modifyEmployeeMutation : insertEmployeeMutation;
      mutation.mutate(
        {
          ...employee,
          startDate: editingEmployee ? employee.startDate : effectiveDate,
        },
        { onSuccess: () => setEmployeeOpen(false) },
      );
      return;
    }

    dispatch(editingEmployee
      ? updateEmployee({ employee, effectiveDate })
      : addEmployee(employee));
    setEmployeeOpen(false);
  };

  const removeEmployee = (employee: OrganizationEmployee) => {
    if (isApiDataSource) {
      deleteEmployeeMutation.mutate(employee);
      return;
    }

    dispatch(deleteEmployee({ id: employee.id, effectiveDate: asOfDate }));
  };

  const openTeamDialog = (team: OrganizationTeam | null) => {
    setEditingTeam(team);
    setTeamName(team?.name ?? '');
    setTeamEffectiveDate(today());
    setTeamOpen(true);
  };

  const saveTeam = () => {
    const name = teamName.trim();
    if (!name) return;

    if (editingTeam) {
      dispatch(updateTeam({
        team: { ...editingTeam, name },
        effectiveDate: teamEffectiveDate,
      }));
    } else {
      dispatch(addTeam({
        id: `team-${Date.now()}`,
        name,
        startDate: teamEffectiveDate,
      }));
    }
    setTeamOpen(false);
  };

  const removeTeam = () => {
    if (!editingTeam) return;
    const memberCount = employees.filter((employee) => employee.teamId === editingTeam.id).length;
    if (memberCount > 0) return;

    dispatch(deleteTeam({ id: editingTeam.id, effectiveDate: teamEffectiveDate }));
    setSelectedTeamId('all');
    setTeamOpen(false);
  };

  const selectedTeam = snapshotTeams.find((team) => team.id === selectedTeamId);
  const shiftWorkerCount = snapshotEmployees.filter((employee) => employee.shiftWorker).length;
  const teamHasMembers = Boolean(editingTeam && employees.some(
    (employee) => employee.teamId === editingTeam.id,
  ));

  return {
    teams: sourceTeams,
    employees: sourceEmployees,
    history: sourceHistory,
    isLoading: isApiDataSource && (
      organizationEmployeesQuery.isLoading ||
      insertEmployeeMutation.isPending ||
      modifyEmployeeMutation.isPending ||
      deleteEmployeeMutation.isPending
    ),
    isError: isApiDataSource && (
      organizationEmployeesQuery.isError ||
      insertEmployeeMutation.isError ||
      modifyEmployeeMutation.isError ||
      deleteEmployeeMutation.isError
    ),
    asOfDate,
    tab,
    selectedTeamId,
    search,
    employeeOpen,
    editingEmployee,
    teamOpen,
    editingTeam,
    teamName,
    teamEffectiveDate,
    snapshotTeams,
    snapshotEmployees,
    visibleEmployees,
    selectedTeam,
    shiftWorkerCount,
    teamHasMembers,
    setTab,
    setSelectedTeamId,
    setSearch,
    setTeamName,
    setTeamEffectiveDate,
    setOrganizationDate,
    openNewEmployee,
    openEditEmployee,
    openTeamDialog,
    saveEmployee,
    removeEmployee,
    saveTeam,
    removeTeam,
    closeEmployeeDialog: () => setEmployeeOpen(false),
    closeTeamDialog: () => setTeamOpen(false),
  };
}
