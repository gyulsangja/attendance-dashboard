'use client';

import { useAppDispatch } from '@/store/hooks';
import { setShiftWeekConfirmed } from '@/store/slices/managementSlice';

type Props = {
  shiftWeekConfirmed: boolean;
  week: {
    startDate: string;
    endDate: string;
  };
};

export const useShiftWeekActions = ({
  shiftWeekConfirmed,
  week,
}: Props) => {
  const dispatch = useAppDispatch();

  const toggleShiftWeekConfirmed = () => {
    dispatch(setShiftWeekConfirmed({
      startDate: week.startDate,
      endDate: week.endDate,
      confirmed: !shiftWeekConfirmed,
    }));
  };

  return { toggleShiftWeekConfirmed };
};
