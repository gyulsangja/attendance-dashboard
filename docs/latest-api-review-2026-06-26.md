# Latest API Review - 2026-06-26

Source files:

- `C:/Users/gyulgyul/Downloads/API_???.xlsx`
- `C:/Users/gyulgyul/Downloads/swagger (2).yaml`

## Implemented In The Latest Excel Spec

### Auth

- `POST /api/login`

Swagger also includes:

- `POST /api/logout`

Frontend status:

- Login wrapper is connected.
- Logout wrapper exists.
- Still need to confirm token payload fields and expiry.

### Common Groups

Excel says implemented:

- `POST /api/common/group/insert`
- `GET /api/common/group/select`
- `GET /api/common/group/{group_code}`
- `PUT /api/common/group/modify/{group_code}`
- `DELETE /api/common/group/delete/{group_code}`

Swagger says:

- `GET /api/common/group/select/{group_code}`
- `POST /api/common/group/modify`
- `POST /api/common/group/delete/{group_code}`

Frontend status:

- Frontend currently follows Swagger paths.
- Common groups are backend seed data, not a generic user-facing management screen.

Need confirmation:

- Which path/method is actual for group detail/modify/delete: Excel or Swagger.

### Common Codes

Excel says implemented:

- `POST /api/common/code/insert`
- `GET /api/common/code/select/`
- `GET /api/common/code/select/{group_code}`
- `POST /api/common/code/modify/{group_code}`
- `DELETE /api/common/code/delete/{group_code}`

Swagger says:

- `GET /api/common/code/select`
- `GET /api/common/code/select/{detail_code}`
- `POST /api/common/code/modify`
- `POST /api/common/group/delete/{detail_code}`

Frontend status:

- Common-code list, insert, modify wrappers exist.
- Attendance codes use `G_ATTEND_STAT` through the attendance-code UI.
- Employee information options use `G_RANK_CODE`, `G_WORK_TYPE`, `G_HOLD_STATUS` through the settings UI.
- Delete wrapper currently uses `/api/common/code/delete/{detailCode}` because Excel names that route more correctly than Swagger's `common/group/delete/{detail_code}`.

Need confirmation:

- Is `select/{...}` filtering by `group_code` or selecting one item by `detail_code`?
- Is delete path `/api/common/code/delete/{...}` or `/api/common/group/delete/{...}`?
- Does modify require a path variable or only body?

### Employees

Excel says implemented:

- `POST /api/employee/insert`
- `GET /api/employee/select`
- `GET /api/employee/select/{emp_no}`
- `POST /api/employee/modify/{emp_no}`
- `DELETE /api/employee/delete/{emp_no}`

Swagger says:

- `POST /api/employee/modify`
- `POST /api/employee/delete/{emp_no}`

Frontend status:

- Employee list/insert/modify/delete wrappers exist.
- Frontend currently follows Swagger for modify/delete methods.
- Employee form now uses common-code-driven rank, work type, and hold status.

Need confirmation:

- Does modify use `/modify` or `/modify/{emp_no}`?
- Does delete use `POST` or `DELETE`?
- Card number / employee number fields still need final policy confirmation.

### Employee Attendance Reasons

Excel says implemented:

- `POST /api/employee/attend/insert`
- `GET /api/employee/attend/select`
- `POST /api/employee/attend/select/items`
- `POST /api/employee/attend/modify`
- `DELETE /api/employee/attend/delete/{emp_no}`

Excel says not implemented:

- `GET /api/employee/attend/select/emp/{emp_no}`

Swagger includes `GET /api/employee/attend/select/emp/{emp_no}` but does not include `select/items`.

Frontend status:

- Added wrapper for `POST /api/employee/attend/select/items`.
- Existing wrapper for `select/emp/{emp_no}` remains, but should not be used until backend confirms it.

Need confirmation:

- Request/response body for `select/items`.
- Delete target should be record id, employee+date, or employee all rows?

### Device Attendance

Excel says implemented:

- `POST /api/attend/manager/upload`
- `GET /api/attend/manager/select/week/{year}/{month}/{week}`
- `GET /api/attend/manager/select/month/{year}/{month}`
- `GET /api/attend/manager/select/year/{year}`

Excel says not implemented:

- `POST /api/attend/manager/modify/{emp_no}`
- `DELETE /api/attend/manager/delete/{week}`

Swagger includes:

- `GET /api/attend/manager/modify`
- `POST /api/attend/manager/delete/week` with query params
- `POST /api/attend/manager/delete/emp_no` with query params

Frontend status:

- Upload and week/month/year select wrappers already exist.
- Added wrappers for Swagger delete/week and delete/emp_no query-param routes.
- Manual modify remains unsafe because Excel says not implemented and Swagger method is `GET`.

Need confirmation:

- Whether delete/week and delete/emp_no are actually implemented despite Excel saying not implemented for delete.
- Manual update API needs a real `POST` route and request body before frontend can connect it.

### User Info

Excel says implemented:

- `POST /api/userinfo/insert`
- `GET /api/userinfo/select`
- `GET /api/userinfo/select/{userid}`
- `POST /api/userinfo/modify/`
- `DELETE /api/userinfo/delete/{userid}`

Swagger says delete is `POST`.

Frontend status:

- User list/insert/modify/delete wrappers exist.
- User role options are based on `G_USER_LEVEL`.

Need confirmation:

- Does delete use `DELETE` or `POST`?
- Confirm modify request body and whether it persists.

### System Settings

Excel says not implemented:

- `POST /api/system/setting`

Swagger says implemented-like docs:

- `POST /api/system/setting/get`
- `POST /api/system/setting/modify`

Frontend status:

- Wrapper exists for Swagger routes.
- UI falls back to frontend defaults when API fails.

Need confirmation:

- Is system setting API implemented now or still pending?
- Request/response fields for regular start/end and half-day times.

## Missing From Both Specs But Still Needed Later

- Operation week status/confirm/cancel/history.
- Shift schedule select/save/delete and shift week confirm/cancel.
- Holiday management for temporary/company holidays.
- Dashboard/statistics aggregate APIs, unless frontend aggregation is accepted.
- Weekly report save/export/history, unless print-only frontend report is enough.

## Frontend Changes From This Review

- Added `employeeApi.selectAttendByItems()` for `POST /api/employee/attend/select/items`.
- Added more flexible employee attendance list response parsing.
- Added `attendanceApi.deleteByWeek()` for `POST /api/attend/manager/delete/week`.
- Added `attendanceApi.deleteByEmployeeWeek()` for `POST /api/attend/manager/delete/emp_no`.

## Next Frontend Work

1. Use Swagger/current wrappers for safe read APIs first:
   - common-code list
   - employee list
   - user list
   - device attendance week/month/year list
2. Do not connect destructive or update actions until method/path conflicts are confirmed:
   - common-code delete
   - employee delete/modify
   - user delete
   - device delete
3. Connect `select/items` only after backend provides exact request/response sample.
4. Keep mock fallback for operation-week confirm, shift schedules, holiday management, and dashboard/statistics aggregates until APIs are added.
