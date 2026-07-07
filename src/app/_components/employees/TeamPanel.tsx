import { Add, Edit, Groups } from '@mui/icons-material';
import { Button, List, ListItemButton, ListItemText } from '@mui/material';
import {
  UNASSIGNED_TEAM_ID,
  UNASSIGNED_TEAM_NAME,
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
};

const memberCountLabel = (count: number) => `${count}${TEXT.memberSuffix}`;

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

        <ListItemButton
          selected={selectedTeamId === UNASSIGNED_TEAM_ID}
          onClick={() => onSelect(UNASSIGNED_TEAM_ID)}
          sx={{ mb: 0.5, borderRadius: 2 }}
        >
          <ListItemText
            primary={UNASSIGNED_TEAM_NAME}
            secondary={memberCountLabel(employees.filter(
              (employee) => employee.teamId === UNASSIGNED_TEAM_ID,
            ).length)}
          />
        </ListItemButton>

        {teams.map((team) => {
          const count = employees.filter((employee) => employee.teamId === team.id).length;

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
      </List>
    </aside>
  );
}
