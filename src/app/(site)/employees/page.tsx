'use client';

import { useMemo, useState } from 'react';
import { Add, Groups, History, Person, Schedule } from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import { useAccess } from '@/app/_components/auth/AccessProvider';
import EmployeeDialog from '@/app/_components/employees/EmployeeDialog';
import EmployeeGrid from '@/app/_components/employees/EmployeeGrid';
import OrganizationHistoryGrid from '@/app/_components/employees/OrganizationHistoryGrid';
import TeamPanel from '@/app/_components/employees/TeamPanel';
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

export default function Page() {
  const access = useAccess();
  const dispatch = useAppDispatch();
  const { teams, employees, history } = useAppSelector((state) => state.organization);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState(0);
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  const [search, setSearch] = useState('');
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<OrganizationEmployee | null>(null);
  const [teamOpen, setTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<OrganizationTeam | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teamEffectiveDate, setTeamEffectiveDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const snapshot = useMemo(
    () => getOrganizationSnapshot(teams, employees, history, asOfDate),
    [teams, employees, history, asOfDate],
  );
  const snapshotTeams = snapshot.teams;
  const snapshotEmployees = snapshot.employees;

  const visibleEmployees = useMemo(
    () => snapshotEmployees.filter((employee) => {
      const matchesTeam = selectedTeamId === 'all' || employee.teamId === selectedTeamId;
      const keyword = search.trim().toLowerCase();
      const teamName = employee.teamId === UNASSIGNED_TEAM_ID
        ? UNASSIGNED_TEAM_NAME
        : snapshotTeams.find((team) => team.id === employee.teamId)?.name ?? '';
      const matchesSearch = !keyword || [employee.name, employee.position, employee.jobTitle, teamName]
        .some((value) => value.toLowerCase().includes(keyword));
      return matchesTeam && matchesSearch;
    }),
    [snapshotEmployees, snapshotTeams, selectedTeamId, search],
  );

  const openNewEmployee = () => {
    setEditingEmployee(null);
    setEmployeeOpen(true);
  };

  const openTeamDialog = (team: OrganizationTeam | null) => {
    setEditingTeam(team);
    setTeamName(team?.name ?? '');
    setTeamEffectiveDate(new Date().toISOString().slice(0, 10));
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

  if (!access.canManageOrganization) {
    return (
      <main className="mx-auto max-w-[1600px]">
        <h1 className="text-2xl font-bold">직원/팀 관리</h1>
        <Alert severity="warning" sx={{ mt: 3 }}>
          {access.roleLabel} 권한으로는 직원 및 조직 정보를 관리할 수 없습니다.
        </Alert>
      </main>
    );
  }

  const selectedTeam = snapshotTeams.find((team) => team.id === selectedTeamId);
  const shiftWorkerCount = snapshotEmployees.filter((employee) => employee.shiftWorker).length;

  return (
    <main className="mx-auto max-w-[1600px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">직원/팀 관리</h1>
          <p className="mt-1 text-sm text-slate-500">
            조직과 구성원의 부서, 직위, 직무 및 교대근무 여부를 관리합니다.
          </p>
        </div>
        <Button variant="contained" startIcon={<Add />} onClick={openNewEmployee}>
          직원 등록
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5">
        <Tabs value={tab} onChange={(_event, value) => setTab(value)}>
          <Tab label="기준일 조직도" />
          <Tab label="조직 변경 이력" icon={<History />} iconPosition="start" />
        </Tabs>
        <TextField
          size="small"
          type="date"
          label="조직 기준일"
          value={asOfDate}
          onChange={(event) => {
            setAsOfDate(event.target.value);
            setSelectedTeamId('all');
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </div>

      {tab === 0 && <><div className="mt-5 grid grid-cols-3 gap-4">
        {[
          { label: '전체 조직', value: `${snapshotTeams.length}개`, icon: <Groups /> },
          { label: '전체 구성원', value: `${snapshotEmployees.length}명`, icon: <Person /> },
          { label: '교대근무자', value: `${shiftWorkerCount}명`, icon: <Schedule /> },
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
          teams={snapshotTeams}
          employees={snapshotEmployees}
          selectedTeamId={selectedTeamId}
          onSelect={setSelectedTeamId}
          onAdd={() => openTeamDialog(null)}
          onEdit={openTeamDialog}
        />

        <section className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                {selectedTeamId === UNASSIGNED_TEAM_ID
                  ? UNASSIGNED_TEAM_NAME
                  : selectedTeam?.name ?? '전체 구성원'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                총 {visibleEmployees.length}명의 구성원이 조회됩니다.
              </p>
            </div>
            <TextField
              size="small"
              placeholder="이름, 부서, 직위 검색"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ width: 260 }}
            />
          </div>

          <div className="h-[490px]">
            <EmployeeGrid
              employees={visibleEmployees}
              teams={snapshotTeams}
              onEdit={(employee) => {
                setEditingEmployee(employee);
                setEmployeeOpen(true);
              }}
              onDelete={(employee) => {
                if (window.confirm(`${employee.name} 직원을 삭제하시겠습니까?`)) {
                  dispatch(deleteEmployee({ id: employee.id, effectiveDate: asOfDate }));
                }
              }}
            />
          </div>
        </section>
      </div></>}

      {tab === 1 && (
        <section className="mt-5 h-[590px] rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold">조직 및 구성원 변경 이력</h2>
            <p className="mt-1 text-sm text-slate-500">
              팀 생성·종료, 입사·퇴사, 부서·직위 및 교대근무 변경 시점을 확인합니다.
            </p>
          </div>
          <div className="h-[490px]">
            <OrganizationHistoryGrid rows={history} />
          </div>
        </section>
      )}

      <EmployeeDialog
        open={employeeOpen}
        employee={editingEmployee}
        teams={teams.filter((team) => !team.endDate)}
        defaultTeamId={selectedTeamId === 'all'
          ? snapshotTeams[0]?.id ?? UNASSIGNED_TEAM_ID
          : selectedTeamId}
        nextId={Math.max(0, ...employees.map((employee) => employee.id)) + 1}
        onClose={() => setEmployeeOpen(false)}
        onSave={(employee, effectiveDate) => {
          dispatch(editingEmployee
            ? updateEmployee({ employee, effectiveDate })
            : addEmployee(employee));
          setEmployeeOpen(false);
        }}
      />

      <Dialog open={teamOpen} onClose={() => setTeamOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingTeam ? '팀 정보 수정' : '팀 추가'}</DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <TextField
            autoFocus
            fullWidth
            label="팀 이름"
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
          />
          <TextField
            fullWidth
            type="date"
            label={editingTeam ? '변경 적용일' : '팀 생성일'}
            value={teamEffectiveDate}
            onChange={(event) => setTeamEffectiveDate(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mt: 2 }}
          />
          {editingTeam && employees.some((employee) => employee.teamId === editingTeam.id) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              소속 직원이 있는 팀은 삭제할 수 없습니다. 직원을 먼저 다른 부서로 이동해주세요.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {editingTeam && (
            <Button
              color="error"
              disabled={employees.some((employee) => employee.teamId === editingTeam.id)}
              onClick={removeTeam}
              sx={{ mr: 'auto' }}
            >
              팀 삭제
            </Button>
          )}
          <Button onClick={() => setTeamOpen(false)}>취소</Button>
          <Button variant="contained" disabled={!teamName.trim()} onClick={saveTeam}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  );
}
