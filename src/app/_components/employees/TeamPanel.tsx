'use client';

import { Add, Edit, Groups } from '@mui/icons-material';
import { Button, List, ListItemButton, ListItemText } from '@mui/material';
import type { OrganizationEmployee, OrganizationTeam } from '@/store/slices/organizationSlice';
import { UNASSIGNED_TEAM_ID, UNASSIGNED_TEAM_NAME } from '@/store/slices/organizationSlice';

type TeamPanelProps = {
  teams: OrganizationTeam[];
  employees: OrganizationEmployee[];
  selectedTeamId: string;
  onSelect: (teamId: string) => void;
  onAdd: () => void;
  onEdit: (team: OrganizationTeam) => void;
};

export default function TeamPanel({
  teams,
  employees,
  selectedTeamId,
  onSelect,
  onAdd,
  onEdit,
}: TeamPanelProps) {
  return (
    <aside className="w-64 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Groups fontSize="small" />
          조직
        </div>
        <Button size="small" startIcon={<Add />} onClick={onAdd}>
          팀 추가
        </Button>
      </div>

      <List disablePadding>
        <ListItemButton
          selected={selectedTeamId === 'all'}
          onClick={() => onSelect('all')}
          sx={{ mb: 0.5, borderRadius: 2 }}
        >
          <ListItemText primary="전체 구성원" secondary={`${employees.length}명`} />
        </ListItemButton>

        <ListItemButton
          selected={selectedTeamId === UNASSIGNED_TEAM_ID}
          onClick={() => onSelect(UNASSIGNED_TEAM_ID)}
          sx={{ mb: 0.5, borderRadius: 2 }}
        >
          <ListItemText
            primary={UNASSIGNED_TEAM_NAME}
            secondary={`${employees.filter(
              (employee) => employee.teamId === UNASSIGNED_TEAM_ID,
            ).length}명`}
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
              <ListItemText primary={team.name} secondary={`${count}명`} />
              <Edit
                fontSize="small"
                sx={{ color: '#94a3b8' }}
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(team);
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </aside>
  );
}
