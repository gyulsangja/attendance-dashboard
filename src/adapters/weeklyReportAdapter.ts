import type {
  WeeklyReportCodeSummaryDto,
  WeeklyReportDto,
  WeeklyReportRecordDto,
  WeeklyReportTimeRowDto,
} from '@/api/dto/report.dto';
import type {
  OperationWeeklyReport,
  OperationWeeklyReportTimeCell,
} from '@/selectors/operationWeeklyReportSelectors';

const toNumber = (value: number | string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toCount = (value: number | string | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getCodeId = (row: WeeklyReportCodeSummaryDto) =>
  row.attendance_code ?? row.attendanceCode ?? row.code_id ?? row.codeId ?? '';

const getCodeLabel = (row: WeeklyReportCodeSummaryDto) =>
  row.attendance_code_name ?? row.attendanceCodeName ?? row.label ?? getCodeId(row);

const getEmployeeId = (
  row: WeeklyReportRecordDto | WeeklyReportTimeRowDto,
  fallback: number,
) => toNumber(
  row.emp_no ?? row.empNo ?? row.employee_id ?? row.employeeId,
  fallback,
);

const getEmployeeName = (row: WeeklyReportRecordDto | WeeklyReportTimeRowDto) =>
  row.emp_name ?? row.empName ?? row.employee_name ?? row.employeeName ?? '-';

const getDepartmentName = (row: WeeklyReportRecordDto | WeeklyReportTimeRowDto) =>
  row.dept_name ?? row.deptName ?? row.department ?? '-';

const getRecordDate = (row: WeeklyReportRecordDto) =>
  row.work_date ?? row.workDate ?? row.date ?? '';

const getRecordTime = (row: WeeklyReportRecordDto) => {
  const checkIn = row.check_in ?? row.checkIn;
  const checkOut = row.check_out ?? row.checkOut;

  return checkIn || checkOut ? `${checkIn ?? '-'} / ${checkOut ?? '-'}` : '-';
};

const getRecordCodeLabel = (row: WeeklyReportRecordDto) =>
  row.attendance_code_name ?? row.attendanceCodeName ?? row.attendance_code ?? row.attendanceCode ?? '';

const formatDateLabel = (date: string) => {
  if (!date) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(`${date}T00:00:00`));
};

const buildRowsFromRecords = (
  records: WeeklyReportRecordDto[],
): OperationWeeklyReport['timeRows'] => {
  const rowMap = new Map<number, OperationWeeklyReport['timeRows'][number]>();

  records.forEach((record, index) => {
    const date = getRecordDate(record);
    if (!date) return;

    const employeeId = getEmployeeId(record, index + 1);
    const row = rowMap.get(employeeId) ?? {
      employeeId,
      department: getDepartmentName(record),
      employeeName: getEmployeeName(record),
      cells: {},
    };

    const cell: OperationWeeklyReportTimeCell = {
      time: getRecordTime(record),
      codes: getRecordCodeLabel(record),
    };

    row.cells[date] = cell;
    rowMap.set(employeeId, row);
  });

  return [...rowMap.values()];
};

const buildRowsFromDto = (
  rows: WeeklyReportTimeRowDto[] | undefined,
): OperationWeeklyReport['timeRows'] =>
  (rows ?? []).map((row, index) => ({
    employeeId: getEmployeeId(row, index + 1),
    department: getDepartmentName(row),
    employeeName: getEmployeeName(row),
    cells: Object.fromEntries(
      Object.entries(row.cells ?? {}).map(([date, cell]) => [
        date,
        {
          time: cell.time ?? '-',
          codes: cell.codes ?? '',
        },
      ]),
    ),
  }));

export const adaptWeeklyReportDtoToOperationReport = (
  dto: WeeklyReportDto | undefined,
  fallback: OperationWeeklyReport,
): OperationWeeklyReport => {
  if (!dto) return fallback;

  const records = dto.records ?? [];
  const explicitColumns = dto.time_columns ?? dto.timeColumns;
  const recordDates = [...new Set(records.map(getRecordDate).filter(Boolean))].sort();
  const timeColumns = explicitColumns?.length
    ? explicitColumns.map((column) => ({
      date: column.date ?? '',
      label: column.label ?? formatDateLabel(column.date ?? ''),
    }))
    : (recordDates.length ? recordDates : fallback.timeColumns.map((column) => column.date))
      .map((date) => ({
        date,
        label: formatDateLabel(date),
      }));
  const codeCounts = (dto.attendance_code_summary ?? dto.attendanceCodeSummary ?? dto.code_counts ?? dto.codeCounts ?? [])
    .map((row) => ({
      codeId: getCodeId(row),
      label: getCodeLabel(row),
      count: toCount(row.count),
      exceptional: row.exceptional ?? false,
    }))
    .filter((row) => row.codeId || row.label);
  const timeRows = records.length
    ? buildRowsFromRecords(records)
    : buildRowsFromDto(dto.time_rows ?? dto.timeRows);

  return {
    title: dto.title ?? fallback.title,
    periodLabel: dto.period_label
      ?? dto.periodLabel
      ?? (
        dto.week_start_date || dto.weekStartDate || dto.week_end_date || dto.weekEndDate
          ? `${dto.week_start_date ?? dto.weekStartDate ?? ''} ~ ${dto.week_end_date ?? dto.weekEndDate ?? ''}`
          : fallback.periodLabel
      ),
    generatedAt: dto.generated_at ?? dto.generatedAt ?? dto.printed_at ?? dto.printedAt ?? fallback.generatedAt,
    codeCounts,
    timeColumns,
    timeRows,
  };
};
