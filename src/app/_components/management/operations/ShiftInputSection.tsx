'use client';

import { Alert, Paper } from '@mui/material';
import type { ManagementOperations } from './useManagementOperations';
import ShiftPanel from './ShiftPanel';

type Props = Pick<ManagementOperations, 'access' | 'actions' | 'dialogs' | 'state'>;

export default function ShiftInputSection({
  dialogs,
  state,
}: Props) {
  const {
    confirmed,
    month,
    shifts,
    week,
    year,
  } = state;

  return (
    <Paper
      elevation={0}
      sx={{ mt: 3, border: '1px solid #e2e8f0', borderRadius: 3, p: 3 }}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        교대근무 일정을 입력하고 운영관리 최종 확정 전까지 수정할 수 있습니다.
      </Alert>
      {confirmed && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          이 주차는 운영관리 최종 확정 상태이므로 교대근무 일정을 변경할 수 없습니다. 관리자에게 운영관리 확정 해제를 요청하세요.
        </Alert>
      )}
      <ShiftPanel
        key={`input-${year}-${month}`}
        rows={shifts}
        year={year}
        month={month}
        selectedWeek={{ startDate: week.startDate, endDate: week.endDate }}
        confirmed={confirmed}
        onAdd={() => dialogs.setShiftOpen(true)}
        onEdit={dialogs.setEditingShift}
        canInput={!confirmed}
      />
    </Paper>
  );
}
