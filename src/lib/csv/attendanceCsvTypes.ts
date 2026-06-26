export type AttendanceCsvRow = {
  row: number;
  employeeName: string;
  department: string;
  date: string;
  checkIn: string;
  checkOut: string;
};

export type AttendanceCsvError = {
  row: number;
  message: string;
};

export type AttendanceCsvResult = {
  totalRows: number;
  rows: AttendanceCsvRow[];
  errors: AttendanceCsvError[];
};

export type AttendanceCsvColumnIndexes = {
  employeeName: number;
  department: number;
  date: number;
  checkIn: number;
  checkOut: number;
};
