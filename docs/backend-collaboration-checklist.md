# Backend Collaboration Checklist - 2026-06-25

This document is the current backend coordination checklist for the attendance dashboard API integration.
It intentionally focuses on items that affect frontend integration now.

## 1. Common Code

Current frontend status:

- `GET /api/common/group/select` is connected.
- `GET /api/common/code/select` is connected.
- Frontend filters the full code list by `group_code` because group-specific detail lookup is not reliable yet.
- Attendance codes are read from `G_ATTEND_STAT`.
- User role codes are read from `G_USER_LEVEL`.
- In API mode, attendance code add/edit/end is disabled because common-code save/modify is unstable or unimplemented.

Backend confirmation needed:

- Confirm whether `POST /api/common/code/insert` is implemented and should persist rows immediately.
- Confirm why the API can return 200 but the code is not visible after `GET /api/common/code/select`.
- Confirm whether `reg_val1/reg_val2` or `ref_val1/ref_val2` are the official request fields.
- Confirm the correct delete endpoint and method for common codes.
- Provide detail codes for employee forms:
  - `G_TEAM_CODE` department/team
  - `G_RANK_CODE` rank/position
  - `G_WORK_TYPE` work type
  - `G_HOLD_STATUS` employment status
- Confirm where attendance-code metadata should be stored:
  - schedulable in operation management
  - exceptional display on dashboard
  - start date
  - end date

Frontend temporary handling:

- Read-only display remains enabled.
- Save/edit/end buttons are blocked in API mode.
- Missing code groups fall back to existing frontend values.

## 2. Employee / Organization

Current frontend status:

- Employee list query is connected.
- Employee insert wrapper uses `{ newemployeeinfo: ... }`.
- Employee delete uses `POST /api/employee/delete/{emp_no}`.
- Employee edit is disabled in API mode because modify is marked unimplemented and did not reliably persist in previous checks.
- Team add/edit is disabled in API mode because no team API exists in the current Swagger.
- Employee dialog can use common codes when available:
  - `G_RANK_CODE` for position select
  - `G_WORK_TYPE` for work type select

Backend confirmation needed:

- Confirm employee modify implementation status.
- Confirm employee detail endpoint response shape.
- Confirm official employee insert/update DTO fields.
- Confirm whether department/team should be common code only or a separate team table/API.
- Confirm whether current test codes are real or sample-only:
  - `TTT12`
  - `DDD123`
  - `USE`
  - `TEE1`

Frontend temporary handling:

- List and delete remain available.
- Edit and team management are blocked in API mode.

## 3. User Management

Current frontend status:

- User list query is connected.
- User insert/delete are connected.
- Role change is disabled in API mode because user modify is marked unimplemented or unreliable.
- Backend role codes are shown separately from frontend permission policy.
- `dev1` is temporarily treated as frontend ADMIN for development access.

Backend confirmation needed:

- Confirm `POST /api/userinfo/modify` implementation status.
- Confirm user insert response message. It previously returned a common-code-group success message.
- Confirm official role code set.
- Confirm frontend permission mapping:
  - admin/full access
  - shift manager
  - general user

Frontend temporary handling:

- List/add/delete remain available.
- Role change is blocked in API mode.

## 4. Device Attendance Upload / Select

Current frontend status:

- Upload endpoint is connected: `POST /api/attend/manager/upload`.
- CSV and XLSX upload are allowed in API mode.
- Select endpoints are connected:
  - week: `/api/attend/manager/select/week/{year}/{month}/{week}`
  - month: `/api/attend/manager/select/month/{year}/{month}`
  - year: `/api/attend/manager/select/year/{year}`
- The frontend deduplicates displayed rows by `employeeId + date`, keeping the last row.
- Manual time edit is disabled in API mode because attend modify is not implemented.

Backend confirmation needed:

- Confirm upload matching key:
  - card number
  - employee number
  - employee name
  - name + department
- Confirm whether repeated upload should update/upsert by employee/card + date.
- Current observed issue: repeated upload accumulates duplicate rows instead of overwriting.
- Confirm XLSX parsing support on backend.
- Confirm response field meaning: `emp_no` sometimes appears to contain a name-like value.
- Confirm whether attend modify/delete APIs are planned.

Frontend temporary handling:

- Upload/select remain available.
- Display dedupe is applied only to prevent duplicate UI rows.
- Database duplication still needs backend upsert.
- Manual time edit is blocked in API mode.

## 5. System Setting

Current frontend status:

- System setting screen exists for normal work time and half-day policy.
- API mode displays values but save is disabled because system setting APIs are not confirmed.

Backend confirmation needed:

- Confirm implementation of:
  - `POST /api/system/setting/get`
  - `POST /api/system/setting/modify`
- Provide request/response DTO for:
  - regular start/end
  - AM half-day 기준
  - PM half-day 기준

## 6. Operation / Shift / Planned Attendance

Current frontend status:

- These remain frontend/mock driven.
- Weekly operation confirm policy exists on the frontend.
- Weekly report preview/print exists on the frontend.

Backend APIs needed later:

- Operation week status select.
- Operation week final confirm/cancel.
- Confirm history.
- Planned attendance schedule CRUD.
- Shift schedule CRUD.
- Shift week confirm/cancel.
- Weekly report save/history if needed.

## 7. Frontend Verification Checklist

Use browser DevTools Console. The frontend API client logs:

- `[API Request] METHOD /backend-api/...`
- request body
- auth attached status
- `[API Response] status METHOD /backend-api/...`
- response payload

Check screens in this order:

1. Login
   - `/api/login`
   - token stored

2. Settings
   - `/api/common/code/select`
   - attendance codes from `G_ATTEND_STAT`
   - add/edit/end buttons disabled in API mode

3. Employees
   - `/api/employee/select`
   - `/api/common/code/select`
   - position/work type select uses common codes only if available
   - edit/team buttons disabled in API mode

4. Users
   - `/api/userinfo/select`
   - `/api/common/code/select`
   - role change disabled in API mode

5. Operation Management / Device CSV tab
   - upload file
   - `/api/attend/manager/upload`
   - select week/month/year response
   - repeated upload should be noted as backend upsert issue if duplicates grow

## 8. Current Frontend Policy

Until backend write APIs are confirmed:

- Prefer read/list integration first.
- Keep mock fallback for missing code groups.
- Disable unstable write/update controls in API mode.
- Record request body and response payload from DevTools before asking backend changes.
