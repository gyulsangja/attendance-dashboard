import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import type { OrganizationTeam } from '@/store/slices/organizationSlice';

type TeamDialogProps = {
  open: boolean;
  editingTeam: OrganizationTeam | null;
  teamName: string;
  teamEffectiveDate: string;
  teamHasMembers: boolean;
  onNameChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
};

const TEXT = {
  editTitle: '팀 정보 수정',
  addTitle: '팀 추가',
  teamName: '팀 이름',
  memberWarning: '소속 직원이 있는 팀은 삭제할 수 없습니다. 직원을 먼저 다른 부서로 이동해 주세요.',
  deleteTeam: '팀 삭제',
  cancel: '취소',
  save: '저장',
};

export default function TeamDialog({
  open,
  editingTeam,
  teamName,
  teamHasMembers,
  onNameChange,
  onClose,
  onSave,
  onDelete,
}: TeamDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editingTeam ? TEXT.editTitle : TEXT.addTitle}</DialogTitle>
      <DialogContent sx={{ pt: '24px !important' }}>
        <TextField
          autoFocus
          fullWidth
          label={TEXT.teamName}
          value={teamName}
          onChange={(event) => onNameChange(event.target.value)}
        />
        {teamHasMembers && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {TEXT.memberWarning}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {editingTeam && (
          <Button
            color="error"
            disabled={teamHasMembers}
            onClick={onDelete}
            sx={{ mr: 'auto' }}
          >
            {TEXT.deleteTeam}
          </Button>
        )}
        <Button onClick={onClose}>{TEXT.cancel}</Button>
        <Button variant="contained" disabled={!teamName.trim()} onClick={onSave}>
          {TEXT.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
