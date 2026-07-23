import { Add, Edit, Groups } from '@mui/icons-material';
import { Button, List, ListItemButton, ListItemText } from '@mui/material';
import {
  EMPLOYEE_GROUP_IDS,
  EMPLOYEE_GROUP_NAMES,
  getEmployeeOrganizationGroupId,
} from '@/lib/organization/employeeGrouping';
import {
  UNASSIGNED_TEAM_ID,
  type OrganizationEmployee,
  type OrganizationTeam,
} from '@/store/slices/organizationSlice';

type TeamPanelProps = {
  teams: OrganizationTeam[];
  employees: OrganizationEmployee[];
  selectedTeamId: string;
  onSelect: (teamId: string) => void;
  onAdd: () => void;
  onEdit: (team: OrganizationTeam) => void;
  editDisabled?: boolean;
};

const TEXT = {
  organization: '조직',
  addTeam: '팀 추가',
  allMembers: '전체 구성원',
  memberSuffix: '명',
  otherGroups: '기타',
};

const specialGroups = [
  { id: UNASSIGNED_TEAM_ID, name: EMPLOYEE_GROUP_NAMES[UNASSIGNED_TEAM_ID] },
  { id: EMPLOYEE_GROUP_IDS.LEAVE, name: EMPLOYEE_GROUP_NAMES[EMPLOYEE_GROUP_IDS.LEAVE] },
  { id: EMPLOYEE_GROUP_IDS.RETIRED, name: EMPLOYEE_GROUP_NAMES[EMPLOYEE_GROUP_IDS.RETIRED] },
];

const memberCountLabel = (count: number) => `${count}${TEXT.memberSuffix}`;

const countEmployeesByGroup = (employees: OrganizationEmployee[], groupId: string) => (
  employees.filter((employee) => getEmployeeOrganizationGroupId(employee) === groupId).length
);

export default function TeamPanel({
  teams,
  employees,
  selectedTeamId,
  onSelect,
  onAdd,
  onEdit,
  editDisabled = false,
}: TeamPanelProps) {
  return (
    <aside className="w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Groups fontSize="small" />
          {TEXT.organization}
        </div>
        <Button size="small" startIcon={<Add />} disabled={editDisabled} onClick={onAdd}>
          {TEXT.addTeam}
        </Button>
      </div>

      <List disablePadding>
        <ListItemButton
          selected={selectedTeamId === 'all'}
          onClick={() => onSelect('all')}
          sx={{ mb: 0.5, borderRadius: 2 }}
        >
          <ListItemText primary={TEXT.allMembers} secondary={memberCountLabel(employees.length)} />
        </ListItemButton>

        {teams.map((team) => {
          const count = countEmployeesByGroup(employees, team.id);

          return (
            <ListItemButton
              key={team.id}
              selected={selectedTeamId === team.id}
              onClick={() => onSelect(team.id)}
              sx={{ mb: 0.5, borderRadius: 2 }}
            >
              <ListItemText primary={team.name} secondary={memberCountLabel(count)} />
              <Edit
                fontSize="small"
                sx={{ color: editDisabled ? '#cbd5e1' : '#94a3b8', pointerEvents: editDisabled ? 'none' : 'auto' }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!editDisabled) onEdit(team);
                }}
              />
            </ListItemButton>
          );
        })}

        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="px-3 pb-2 text-xs font-semibold text-slate-500">{TEXT.otherGroups}</p>
          {specialGroups.map((group) => (
            <ListItemButton
              key={group.id}
              selected={selectedTeamId === group.id}
              onClick={() => onSelect(group.id)}
              sx={{ mb: 0.5, borderRadius: 2 }}
            >
              <ListItemText
                primary={group.name}
                secondary={memberCountLabel(countEmployeesByGroup(employees, group.id))}
              />
            </ListItemButton>
          ))}
        </div>
      </List>
    </aside>
  );
}
