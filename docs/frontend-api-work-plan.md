# Frontend API Work Plan

Updated after the 2026-06-26 backend meeting.

## Decisions

- Use every API that already exists in Swagger first.
- Ask for new APIs only when a screen cannot be completed with current Swagger APIs.
- Backend will seed common groups only.
- Frontend must provide a common-code management screen for common-code details.
- Attendance codes use the common group/common code structure, not a separate table.
- Backend owns device-file upload, overwrite, and automatic attendance judgement.
- Backend owns default holiday data. Frontend needs screens/APIs for temporary/company holidays.

## Swagger APIs To Use First

### Auth

- `POST /api/login`
- `POST /api/logout`

Confirm:

- JWT bearer format: `Authorization: Bearer {token}`
- token expiry
- whether JWT payload includes `userid`, `role_code`, `emp_no`
- if not, frontend should load user detail after login

### Common Groups

- `POST /api/common/group/insert`
- `GET /api/common/group/select`
- `GET /api/common/group/select/{group_code}`
- `POST /api/common/group/modify`
- `POST /api/common/group/delete/{group_code}`

Frontend role:

- Common groups are backend seed data.
- Frontend should not expose common groups as a generic user-facing screen. It should map each group to business screens such as employee options, attendance codes, and user roles.

Required seed groups:

- `G_TEAM_CODE`
- `G_RANK_CODE`
- `G_WORK_TYPE`
- `G_HOLD_STATUS`
- `G_USER_LEVEL`
- `G_ATTEND_STAT`
- `G_HOLIDAY_TYPE`

### Common Codes

- `POST /api/common/code/insert`
- `GET /api/common/code/select`
- `GET /api/common/code/select/{detail_code}`
- `POST /api/common/code/modify`
- `POST /api/common/code/delete/{detail_code}` or confirm actual URI

Confirm:

- Delete URI. Swagger text previously showed a suspicious `common/group/delete/{detail_code}` path.
- Whether save fields are `ref_val1/ref_val2` or `reg_val1/reg_val2`.
- Whether `sort_order` is string or number.
- Whether create/update immediately appears in `GET /api/common/code/select`.

Frontend role:

- Settings screen manages common codes by selected `group_code`.
- Employee/user/attendance-code screens consume `GET /api/common/code/select` and filter by `group_code`.

### Employees

- `POST /api/employee/insert`
- `GET /api/employee/select`
- `GET /api/employee/select/{emp_no}`
- `POST /api/employee/modify`
- `POST /api/employee/delete/{emp_no}`

Confirm fields:

- `emp_no`
- `emp_name`
- `dept_code`
- `rank_code`
- `work_type_code`
- `hold_stat_code`
- `role_code`
- `card_no` or `attend_card_no`
- `shift_yn`
- `hire_date`
- `retire_date`

### User Info

- `POST /api/userinfo/insert`
- `GET /api/userinfo/select`
- `GET /api/userinfo/select/{userid}`
- `POST /api/userinfo/modify`
- `POST /api/userinfo/delete/{userid}`

Confirm:

- user-to-employee relation by `emp_no`
- role field name
- modify request/response shape

### Employee Attendance Reasons

- `POST /api/employee/attend/insert`
- `GET /api/employee/attend/select`
- `GET /api/employee/attend/select/emp/{emp_no}`
- `POST /api/employee/attend/modify`
- `POST /api/employee/attend/delete/{emp_no}`

Use for:

- annual leave
- half-day leave
- sick leave
- remote work
- business trip
- other attendance reason registrations

Confirm:

- date field name
- attendance code field name
- whether update/delete can target employee + date or needs a record id

### Device Attendance

- `POST /api/attend/manager/upload`
- `GET /api/attend/manager/select/{week}`
- `GET /api/attend/manager/modify` or confirm actual update API
- `POST /api/attend/manager/delete/{emp_no}`

Confirm:

- `{week}` format
- update method and body
- whether delete by week is supported
- upload overwrite rule: same employee/card + same date should upsert, not duplicate
- automatic judgement response shape

### System Settings

- `POST /api/system/setting/get`
- `POST /api/system/setting/modify`

Need fields:

- `general_check_in_time`
- `general_check_out_time`
- `morning_half_day_time`
- `afternoon_half_day_time`

Confirm:

- request/response field names
- whether backend automatic judgement uses these values

## New APIs To Request

### Holiday Management

- `GET /api/holiday/select?year=2026`
- `POST /api/holiday/insert`
- `POST /api/holiday/modify`
- `POST /api/holiday/delete/{holiday_id}`

Fields:

- `holiday_id`
- `holiday_date`
- `holiday_name`
- `holiday_type`
- `is_active`

Types:

- `LEGAL`
- `SUBSTITUTE`
- `TEMPORARY`
- `ELECTION`
- `COMPANY`

### Operation Week Confirmation

- `GET /api/operation/week/status?year=2026&month=6&week=3`
- `POST /api/operation/week/confirm`
- `POST /api/operation/week/cancel`
- `GET /api/operation/week/history`

Fields:

- `year`
- `month`
- `week`
- `confirmed_yn`
- `confirmed_at`
- `confirmed_by`
- `cancelled_at`
- `cancelled_by`

Rules:

- Confirmed week is locked.
- Device upload, manual edit, attendance reason edit, and shift edit are blocked after confirmation.
- Cancel confirmation before edits.

### Shift Schedule

- `GET /api/shift/schedule/select?year=2026&month=6`
- `POST /api/shift/schedule/save`
- `POST /api/shift/schedule/delete`
- `POST /api/shift/week/confirm`
- `POST /api/shift/week/cancel`

Fields:

- `emp_no`
- `work_date`
- `start_time`
- `end_time`
- `year`
- `month`
- `week`
- `confirmed_yn`

Rules:

- Shift employee has attendance duty only on scheduled dates.
- No schedule means no absence.
- Shift schedule confirmation is weekly.

### Manual Device Record Update

If current Swagger `GET /api/attend/manager/modify` is not a real update API:

- `POST /api/attend/manager/modify`

Fields:

- `emp_no` or `card_no`
- `work_date`
- `check_in_time`
- `check_out_time`
- `attendance_code`
- `memo`

### Week/Month/Year Device Select

If `select/{week}` is insufficient:

- `GET /api/attend/manager/select/week/{year}/{month}/{week}`
- `GET /api/attend/manager/select/month/{year}/{month}`
- `GET /api/attend/manager/select/year/{year}`

### Dashboard And Statistics Aggregates

Can be calculated in frontend temporarily, but backend aggregate APIs are preferred:

- `GET /api/dashboard/weekly-summary?year=2026&month=6&week=3`
- `GET /api/dashboard/attendance-code-summary?year=2026&month=6&week=3`
- `GET /api/dashboard/exceptional-attendance?year=2026&month=6&week=3`
- `GET /api/statistics/attendance-summary`
- `GET /api/statistics/attendance-code-summary`
- `GET /api/statistics/records`

### Weekly Report

Not required immediately if frontend only prints the confirmed week preview.
Needed later if report save/export history is required:

- `GET /api/weekly-report/preview?year=2026&month=6&week=3`
- `POST /api/weekly-report/export`
- `GET /api/weekly-report/history`

## Frontend Screens To Update

### Settings

- Employee information option management panel: done as a first pass.
- Attendance code management uses `G_ATTEND_STAT` common codes through the attendance-code UI.
- System time settings call system setting APIs when stable.
- Holiday management screen still needed.

### Employee / Organization

- Select options from common codes:
  - department: `G_TEAM_CODE`
  - rank: `G_RANK_CODE`
  - work type: `G_WORK_TYPE`
  - hold status: `G_HOLD_STATUS`
  - role: `G_USER_LEVEL`
- Add card number field when backend field is confirmed.
- Connect employee modify API when request shape is confirmed.

### User Admin

- Role options from `G_USER_LEVEL`.
- Connect user modify API when request shape is confirmed.
- Show relation to employee `emp_no`.

### Management

- Weekly period remains the primary unit.
- Upload device files via backend.
- After upload, reload backend judgement result.
- Connect manual update when API is confirmed.
- Connect operation-week confirm/cancel after new API is available.
- Connect shift schedule APIs after new API is available.

### Dashboard

- Load selected week confirmation state.
- Show confirmed-data cards only for confirmed weeks.
- Use `G_ATTEND_STAT` common codes for attendance-code labels.

### Reports / Statistics

- Monthly attendance record uses year + month.
- Conditional view supports year + month + week.
- Calendar is default view.
- Confirmed-data policy should be applied when backend status API exists.

### Weekly Report

- Enable only for confirmed weeks.
- Preview and print can remain frontend-only for now.
- Add backend report APIs only if save/export history is required.

## Shared Logic To Maintain

- DTO adapters should remain the boundary between Swagger response shapes and frontend domain models.
- API mode should call backend first.
- Missing APIs should keep mock fallback until backend is available.
- Device-file automatic judgement should stay mock-only in frontend; backend owns real judgement.
- Week calculation logic should stay shared across dashboard, management, reports, and weekly report.
