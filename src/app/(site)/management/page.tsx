'use client';

import { useEffect } from 'react';
import { Alert } from '@mui/material';
import {
  ManagementDialogs,
  OperationHeader,
  OperationManagementSection,
  ShiftInputSection,
  useManagementOperations,
} from '@/app/_components';

const tabByQuery: Record<string, number> = {
  schedule: 0,
  device: 1,
  shift: 2,
  confirm: 3,
};

export default function Page() {
  const operations = useManagementOperations();
  const { access, actions, setTab, state } = operations;

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (tab && tabByQuery[tab] !== undefined) {
      setTab(tabByQuery[tab]);
    }
  }, [setTab]);

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
