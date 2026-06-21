'use client';

import { Alert, Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import {
  deviceUploadMock,
  type AttendanceRecord,
  type OperationSchedule,
} from '@/mocks';
import WeeklyAttendanceGrid from './WeeklyAttendanceGrid';

type DevicePanelProps = {
  uploaded: boolean;
  onUpload: () => void;
  days: { date: string; label: string }[];
  records: AttendanceRecord[];
  schedules: OperationSchedule[];
  onEdit: (employeeId: number, date: string) => void;
};

export default function DevicePanel({
  uploaded,
  onUpload,
  days,
  records,
  schedules,
  onEdit,
}: DevicePanelProps) {
  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-bold">단말기 출퇴근 데이터</h2>
          <p className="mt-1 text-sm text-slate-500">
            CSV 업로드 후 근태 일정과 출퇴근 시간을 함께 검토하고 수정합니다.
          </p>
        </div>

        {uploaded && (
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUpload />}
          >
            CSV 다시 업로드
            <input hidden type="file" accept=".csv" onChange={onUpload} />
          </Button>
        )}
      </div>

      {uploaded ? (
        <>
          <Alert severity="success" sx={{ mt: 3 }}>
            {deviceUploadMock.fileName} · 전체 {deviceUploadMock.totalRows}건 중{' '}
            {deviceUploadMock.validRows}건 정상, {deviceUploadMock.errorRows}건 확인 필요
          </Alert>

          <WeeklyAttendanceGrid
            days={days}
            records={records}
            schedules={schedules}
            onEdit={onEdit}
          />
        </>
      ) : (
        <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <CloudUpload sx={{ fontSize: 44, color: '#64748b' }} />
          <p className="mt-2 font-bold">
            CSV 파일을 선택하거나 이곳에 놓아주세요
          </p>
          <Button
            component="label"
            variant="contained"
            sx={{ mt: 3, bgcolor: '#0f172a' }}
          >
            파일 선택
            <input hidden type="file" accept=".csv" onChange={onUpload} />
          </Button>
        </div>
      )}
    </>
  );
}
