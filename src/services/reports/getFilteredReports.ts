import { attendanceDaily } from '@/mocks/attendanceDaily';
import { attendanceDailyCodes } from '@/mocks/attendanceDailyCodes';
import { attendanceCodes } from '@/mocks/attendanceCodes';

type Params = {
  startDate: string;
  endDate: string;
  codes: string[];
};

export type FilteredReportRow = {
  id: string;
  rowNo: number;
  date: string;
  displayDate: string;
  employeeId: number;
  name: string;
  department: string;
  codeId: string;
  content: string;
  contentDetail: string;
  checkIn?: string;
  checkOut?: string;
  memo?: string;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const formatDisplayDate = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  const weekday = WEEKDAYS[date.getDay()];

  return `${dateString}(${weekday})`;
};

export async function getFilteredReports({
  startDate,
  endDate,
  codes,
}: Params): Promise<FilteredReportRow[]> {
  const rows = attendanceDaily
    .filter((daily) => {
      return daily.date >= startDate && daily.date <= endDate;
    })
    .flatMap((daily) => {
      const matchedCodes = attendanceDailyCodes.filter((dailyCode) => {
        const isSameDaily = dailyCode.attendanceDailyId === daily.id;
        const isSelectedCode =
          codes.length === 0 || codes.includes(dailyCode.codeId);

        return isSameDaily && isSelectedCode;
      });

      return matchedCodes.map((dailyCode) => {
        const codeMaster = attendanceCodes.find(
          (code) => code.id === dailyCode.codeId
        );

        return {
          id: `${daily.id}-${dailyCode.id}`,
          rowNo: 0,
          date: daily.date,
          displayDate: formatDisplayDate(daily.date),
          employeeId: daily.employeeId,
          name: daily.name,
          department: daily.department,
          codeId: dailyCode.codeId,
          content: codeMaster?.label ?? dailyCode.codeId,
          contentDetail: dailyCode.detail ?? '',
          checkIn: daily.checkIn,
          checkOut: daily.checkOut,
          memo: daily.memo,
        };
      });
    });

  return rows.map((row, index) => ({
    ...row,
    rowNo: index + 1,
  }));
}