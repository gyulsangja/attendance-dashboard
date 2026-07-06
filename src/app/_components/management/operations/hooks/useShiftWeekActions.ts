'use client';

import {
  useCancelAttendManagerShiftWeekMutation,
  useConfirmAttendManagerShiftWeekMutation,
} from '@/hooks/useAttendManagerQueries';
import { isApiDataSource } from '@/repositories/config';
import { useAppDispatch } from '@/store/hooks';
import { setShiftWeekConfirmed } from '@/store/slices/managementSlice';

type Props = {
  shiftWeekConfirmed: boolean;
  year: number;
  month: number;
  weekNumber: number;
  week: {
    startDate: string;
    endDate: string;
  };
};

export const useShiftWeekActions = ({
  shiftWeekConfirmed,
  year,
  month,
  weekNumber,
  week,
}: Props) => {
  const dispatch = useAppDispatch();
  const confirmMutation = useConfirmAttendManagerShiftWeekMutation();
  const cancelMutation = useCancelAttendManagerShiftWeekMutation();

  const toggleShiftWeekConfirmed = async () => {
    if (isApiDataSource) {
      const params = { year, month, week: weekNumber };
      if (shiftWeekConfirmed) {
        await cancelMutation.mutateAsync(params);
      } else {
        await confirmMutation.mutateAsync(params);
      }
      return;
    }

    dispatch(setShiftWeekConfirmed({
      startDate: week.startDate,
      endDate: week.endDate,
      confirmed: !shiftWeekConfirmed,
    }));
  };

  return { toggleShiftWeekConfirmed };
};
