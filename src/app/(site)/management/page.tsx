'use client';

import { Alert } from '@mui/material';
import ManagementDialogs from '@/app/_components/management/operations/ManagementDialogs';
import OperationHeader from '@/app/_components/management/operations/OperationHeader';
import OperationManagementSection from '@/app/_components/management/operations/OperationManagementSection';
import ShiftInputSection from '@/app/_components/management/operations/ShiftInputSection';
import { useManagementOperations } from '@/app/_components/management/operations/useManagementOperations';

export default function Page() {
  const operations = useManagementOperations();
  const { access, actions, state } = operations;

  return (
    <main className="mx-auto max-w-[1600px]">
      <OperationHeader
        year={state.year}
        month={state.month}
        weekNumber={state.weekNumber}
        weekOptions={state.weekOptions}
        showPeriod={access.canManageOperations || access.canInputShifts}
        onYearChange={actions.setOperationYear}
        onMonthChange={actions.setOperationMonth}
        onWeekChange={actions.setOperationWeek}
      />

      {!access.canManageOperations && !access.canInputShifts && (
        <Alert severity="warning" sx={{ mt: 5 }}>
          {access.roleLabel} 권한으로는 운영관리 메뉴를 사용할 수 없습니다.
        </Alert>
      )}

      {access.canManageOperations && (
        <OperationManagementSection {...operations} />
      )}

      {access.canInputShifts && !access.canManageOperations && (
        <ShiftInputSection {...operations} />
      )}

      <ManagementDialogs {...operations} />
    </main>
  );
}
