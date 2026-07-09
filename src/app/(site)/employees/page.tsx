'use client';

import { useMemo } from 'react';
import { Add, Groups, History, Person, Schedule } from '@mui/icons-material';
import { Alert, Button, CircularProgress, Paper, Tab, Tabs, TextField } from '@mui/material';
import { useAccess } from '@/app/_components';
import { EmployeeDialog } from '@/app/_components';
import {
  useCommonCodesQuery,
  useDeleteCommonCodeMutation,
  useInsertCommonCodeMutation,
  useModifyCommonCodeMutation,
} from '@/hooks/useCommonCodeQueries';
import {
  EmployeeGrid,
  OrganizationHistoryGrid,
  TeamDialog,
  TeamPanel,
  useOrganizationManagement,
} from '@/app/_components';
import { isApiDataSource } from '@/repositories/config';
import type { CommonCode } from '@/adapters/commonCodeAdapter';
import {
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
  type OrganizationTeam,
} from '@/store/slices/organizationSlice';


const DEPARTMENT_GROUP_CODE = 'G_TEAM_CODE';

const createNextDepartmentCode = (codes: CommonCode[]) => {
  const departmentCodes = codes.filter((code) => code.groupCode === DEPARTMENT_GROUP_CODE);
  const maxNumber = departmentCodes.reduce((max, code) => {
    const match = code.detailCode.match(/^TEAM(\d+)$/);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return `TEAM${String(maxNumber + 1).padStart(2, '0')}`;
};

const getNextDepartmentSortOrder = (codes: CommonCode[]) => {
  const departmentCodes = codes.filter((code) => code.groupCode === DEPARTMENT_GROUP_CODE);
  return departmentCodes.reduce((max, code) => Math.max(max, code.sortOrder), 0) + 1;
};

export default function Page() {
  const access = useAccess();
  const organization = useOrganizationManagement();
  const commonCodesQuery = useCommonCodesQuery();
  const insertCommonCodeMutation = useInsertCommonCodeMutation();
  const modifyCommonCodeMutation = useModifyCommonCodeMutation();
  const deleteCommonCodeMutation = useDeleteCommonCodeMutation();
  const commonCodes = useMemo(() => commonCodesQuery.data ?? [], [commonCodesQuery.data]);
  const rankOptions = useMemo(
    () => commonCodes
      .filter((code) => code.groupCode === 'G_RANK_CODE' && code.isActive && code.detailCode)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((code) => ({ value: code.detailCode, label: code.label })),
    [commonCodes],
  );
  const departmentTeams = useMemo<OrganizationTeam[]>(
    () => commonCodes
      .filter((code) => code.groupCode === DEPARTMENT_GROUP_CODE && code.isActive && code.detailCode)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((code) => ({
        id: code.detailCode,
        name: code.label,
        startDate: '2024-01-01',
      })),
    [commonCodes],
  );
  const workTypeOptions = useMemo(
    () => commonCodes
      .filter((code) => code.groupCode === 'G_WORK_TYPE' && code.isActive && code.detailCode)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((code) => ({ value: code.detailCode, label: code.label })),
    [commonCodes],
  );
  const holdStatusOptions = useMemo(
    () => commonCodes
      .filter((code) => code.groupCode === 'G_HOLD_STATUS' && code.isActive && code.detailCode)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((code) => ({ value: code.detailCode, label: code.label })),
    [commonCodes],
  );


  const effectiveTeams = isApiDataSource && departmentTeams.length > 0
    ? departmentTeams
    : organization.snapshotTeams;
  const selectedTeam = effectiveTeams.find((team) => team.id === organization.selectedTeamId);
  const teamMutationLoading = insertCommonCodeMutation.isPending
    || modifyCommonCodeMutation.isPending
    || deleteCommonCodeMutation.isPending;
  const teamMutationError = insertCommonCodeMutation.isError
    || modifyCommonCodeMutation.isError
    || deleteCommonCodeMutation.isError;

  const saveTeam = () => {
    if (!isApiDataSource) {
      organization.saveTeam();
      return;
    }

    const name = organization.teamName.trim();
    if (!name) return;

    const editingCode = organization.editingTeam
      ? commonCodes.find(
        (code) => code.groupCode === DEPARTMENT_GROUP_CODE
          && code.detailCode === organization.editingTeam?.id,
      )
      : null;
    const nextCode: CommonCode = {
      groupCode: DEPARTMENT_GROUP_CODE,
      detailCode: organization.editingTeam?.id ?? createNextDepartmentCode(commonCodes),
      label: name,
      sortOrder: editingCode?.sortOrder ?? getNextDepartmentSortOrder(commonCodes),
      isActive: true,
      refVal1: editingCode?.refVal1 ?? '',
      refVal2: editingCode?.refVal2 ?? '',
      etc: editingCode?.etc ?? '',
    };
    const mutation = organization.editingTeam ? modifyCommonCodeMutation : insertCommonCodeMutation;
    mutation.mutate(nextCode, { onSuccess: organization.closeTeamDialog });
  };

  const removeTeam = () => {
    if (!isApiDataSource) {
      organization.removeTeam();
      return;
    }

    if (!organization.editingTeam) return;
    deleteCommonCodeMutation.mutate(organization.editingTeam.id, {
      onSuccess: organization.closeTeamDialog,
    });
  };

  if (!access.canManageOrganization) {
    return (
      <main className="mx-auto max-w-[1600px]">
        <h1 className="text-2xl font-bold">직원/조직 관리</h1>
        <Alert severity="warning" sx={{ mt: 3 }}>
          {access.roleLabel} 권한으로는 직원 및 조직 정보를 관리할 수 없습니다.
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1600px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">직원/조직 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            조직과 구성원의 부서, 직위, 직무 및 교대근무 여부를 관리합니다.
          </p>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={organization.openNewEmployee}>
          직원 등록
        </Button>
      </div>

      {isApiDataSource && (
        <Alert severity="info" sx={{ mt: 3 }}>
          직원 목록과 직원 등록/수정/삭제, 팀 추가/수정/삭제는 백엔드 API 기준으로 처리합니다.
        </Alert>
      )}

      {organization.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          직원 목록을 불러오거나 저장하지 못했습니다.
        </Alert>
      )}
      {isApiDataSource && commonCodesQuery.isError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          공통코드 API를 불러오지 못했습니다. 부서/직급/근무유형/재직상태 선택값을 확인할 수 없습니다.
        </Alert>
      )}
      {isApiDataSource && teamMutationError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          팀 정보를 저장하지 못했습니다. 공통코드 API 저장 구조를 확인해 주세요.
        </Alert>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5">
        <Tabs value={organization.tab} onChange={(_event, value) => organization.setTab(value)}>
          <Tab label="기준 조직도" />
          <Tab label="조직 변경 이력" icon={<History />} iconPosition="start" />
        </Tabs>
        <TextField
          size="small"
          type="date"
          label="조직 기준일"
          value={organization.asOfDate}
          onChange={(event) => organization.setOrganizationDate(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </div>

      {organization.isLoading ? (
        <div className="flex min-h-[460px] items-center justify-center">
          <CircularProgress size={32} />
        </div>
      ) : teamMutationLoading ? (
        <div className="flex min-h-[460px] items-center justify-center">
          <CircularProgress size={32} />
        </div>
      ) : organization.tab === 0 ? (
        <>
          <div className="mt-5 grid grid-cols-3 gap-4">
            {[
              { label: '전체 조직', value: `${effectiveTeams.length}개`, icon: <Groups /> },
              { label: '전체 구성원', value: `${organization.snapshotEmployees.length}명`, icon: <Person /> },
              { label: '교대근무자', value: `${organization.shiftWorkerCount}명`, icon: <Schedule /> },
            ].map((item) => (
              <Paper key={item.label} elevation={0} className="border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-1 text-2xl font-bold">{item.value}</p>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-3 text-slate-600">{item.icon}</div>
                </div>
              </Paper>
            ))}
          </div>

          <div className="mt-5 flex min-h-[590px] gap-5">
            <TeamPanel
              teams={effectiveTeams}
              employees={organization.snapshotEmployees}
              selectedTeamId={organization.selectedTeamId}
              onSelect={organization.setSelectedTeamId}
              onAdd={() => organization.openTeamDialog(null)}
              onEdit={organization.openTeamDialog}
              editDisabled={false}
            />

            <section className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">
                    {organization.selectedTeamId === UNASSIGNED_TEAM_ID
                      ? UNASSIGNED_TEAM_NAME
                      : selectedTeam?.name ?? '전체 구성원'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    총 {organization.visibleEmployees.length}명의 구성원이 조회됩니다.
                  </p>
                </div>
                <TextField
                  size="small"
                  placeholder="이름, 부서, 직위 검색"
                  value={organization.search}
                  onChange={(event) => organization.setSearch(event.target.value)}
                  sx={{ width: 260 }}
                />
              </div>

              <div className="h-[490px]">
                <EmployeeGrid
                  employees={organization.visibleEmployees}
                  teams={effectiveTeams}
                  onEdit={organization.openEditEmployee}
                  editDisabled={false}
                  onDelete={(employee) => {
                    if (window.confirm(`${employee.name} 직원을 삭제하시겠습니까?`)) {
                      organization.removeEmployee(employee);
                    }
                  }}
                />
              </div>
            </section>
          </div>
        </>
      ) : (
        <section className="mt-5 h-[590px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold">조직 및 구성원 변경 이력</h2>
            <p className="mt-1 text-sm text-slate-500">
              팀 생성/종료, 입사/퇴사, 부서/직무 및 교대근무 변경 시점을 확인합니다.
            </p>
          </div>
          <div className="h-[490px]">
            <OrganizationHistoryGrid rows={organization.history} />
          </div>
        </section>
      )}

      <EmployeeDialog
        open={organization.employeeOpen}
        employee={organization.editingEmployee}
        teams={(isApiDataSource ? effectiveTeams : organization.teams).filter((team) => !team.endDate)}
        defaultTeamId={organization.selectedTeamId === 'all'
          ? effectiveTeams[0]?.id ?? UNASSIGNED_TEAM_ID
          : organization.selectedTeamId}
        nextId={Math.max(0, ...organization.employees.map((employee) => employee.id)) + 1}
        positionOptions={rankOptions}
        jobTitleOptions={workTypeOptions}
        holdStatusOptions={holdStatusOptions}
        onClose={organization.closeEmployeeDialog}
        onSave={organization.saveEmployee}
      />

      <TeamDialog
        open={organization.teamOpen}
        editingTeam={organization.editingTeam}
        teamName={organization.teamName}
        teamEffectiveDate={organization.teamEffectiveDate}
        teamHasMembers={organization.teamHasMembers}
        onNameChange={organization.setTeamName}
        onDateChange={organization.setTeamEffectiveDate}
        onClose={organization.closeTeamDialog}
        onSave={saveTeam}
        onDelete={removeTeam}
      />
    </main>
  );
}


