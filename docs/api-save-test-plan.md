# API 저장 테스트 계획

실제 백엔드 데이터가 변경될 수 있으므로 저장 테스트는 테스트 식별자만 사용하고, 등록 후 조회와 삭제까지 확인한다.

## 공통 원칙

- 테스트 데이터는 `FE_TEST_`, `fe` 또는 `999` 계열만 사용한다.
- 기존 운영 데이터는 수정하거나 삭제하지 않는다.
- 등록 후 조회로 반영 여부를 확인한다.
- 삭제는 테스트 데이터에 대해서만 수행한다.
- 실패 시 요청 URL, method, request body, response body, 화면 오류 메시지를 기록한다.

## 1. 사용자 API

대상 API:

- `POST /api/userinfo/insert`
- `GET /api/userinfo/select`
- `GET /api/userinfo/select/{userid}`
- `POST /api/userinfo/modify`
- `POST /api/userinfo/delete/{userid}`

### 확인 결과

- 로그인 토큰으로 사용자 목록/상세 조회 가능
- `POST /api/userinfo/insert` 등록 성공 확인
- `GET /api/userinfo/select/{userid}` 등록 직후 조회 성공 확인
- `POST /api/userinfo/delete/{userid}` 삭제 성공 확인
- `POST /api/userinfo/modify`는 200 응답이 오지만 실제 조회 결과가 변경되지 않음

### 정상 등록 DTO

```json
{
  "newuserinfo": {
    "user_id": "FE_TEST_USER",
    "password": "1234",
    "emp_no": "00000000",
    "user_name": "FE API TEST",
    "role_code": "ROLE_USER",
    "acc_stat_code": "ACC01",
    "etc": ""
  }
}
```

### 실패했던 DTO

- `role_code`에 프론트 권한값 `GENERAL`을 그대로 보내면 500 발생
- `userid`, `username`, `name`, `auth_cd` 등 프론트 별칭 필드를 섞어 보내면 500 발생

### 프론트 반영

- 프론트 권한은 화면 내부에서 `ADMIN`, `GENERAL` 등으로 유지한다.
- API 요청 시에만 백엔드 권한 코드로 변환한다.
- 현재 매핑:
  - `ADMIN`, `EXECUTIVE`, `ORGANIZATION_MANAGER` -> `ROLE_SUPER`
  - `SHIFT_MANAGER`, `GENERAL` -> `ROLE_USER`

## 2. 직원 API

대상 API:

- `POST /api/employee/insert`
- `GET /api/employee/select`
- `GET /api/employee/select/{emp_no}`
- `POST /api/employee/modify`
- `POST /api/employee/delete/{emp_no}`

### 확인 결과

- `POST /api/employee/insert`는 `{ "newemployeeinfo": ... }` wrapper를 쓰면 등록 성공
- wrapper 없이 직원 DTO를 바로 보내면 500 발생
- `GET /api/employee/select` 목록에서 등록 데이터 확인 가능
- `POST /api/employee/delete/{emp_no}` 삭제 성공
- `GET /api/employee/select/{emp_no}` 상세 조회는 직원 상세가 아니라 인증 성공 메시지만 반환
- `POST /api/employee/modify`는 200 응답이 오지만 실제 목록 데이터가 변경되지 않음

### 정상 등록 DTO

```json
{
  "newemployeeinfo": {
    "emp_company": "LX",
    "emp_no": "999001",
    "emp_name": "FE API TEST",
    "dept_code": "TTT12",
    "rank_code": "DDD123",
    "work_type_code": "USE",
    "hold_stat_code": "TEE1",
    "email": "",
    "phone_no": "",
    "hire_date": "2026-06-24",
    "retire_date": null,
    "shift_yn": "N",
    "etc": ""
  }
}
```

### 프론트 반영

- 직원 등록/수정 API 요청 wrapper를 Swagger 구조에 맞춤
  - 등록: `{ "newemployeeinfo": ... }`
  - 수정: `{ "employeeinfo": ... }`
- 프론트에 없는 회사/이메일/전화는 API DTO에서 기본값으로 보낸다.

다음 확인 순서:

1. 직원 목록에서 실제 코드값 확인
2. `999001` 테스트 직원 등록
3. 상세 조회로 반영 확인
4. 수정 API 반영 확인
5. 테스트 직원 삭제

## 3. 근태코드 API

대상 API:

- `POST /api/common/code/insert`
- `GET /api/common/code/select`
- `GET /api/common/code/select/{detail_code}`
- `POST /api/common/code/modify`
- `POST /api/common/code/delete/{detail_code}`

확인 필요:

- Swagger에는 `reg_val1`, `reg_val2`가 있으나 조회 예시는 `ref_val1`, `ref_val2`를 사용한다.
- 프론트 근태코드 확장 필드 `isSchedulable`, `isExceptional`, `startDate`, `endDate`를 `etc` JSON으로 저장 가능한지 확인해야 한다.

### 2026-06-24 공통코드 테스트 결과

상세 결과는 [common-code-api-test.md](./common-code-api-test.md)에 정리했다.

- `GET /api/common/group/select` 성공
- `GET /api/common/code/select` 성공
- 그룹 목록에는 `G_TEAM_CODE`, `G_RANK_CODE`, `G_USER_LEVEL`, `G_ATTEND_STAT` 등이 있음
- 상세코드 목록에는 현재 `G_ATTEND_STAT`, `G_USER_LEVEL`만 확인됨
- 직원 등록에 필요한 `dept_code`, `rank_code`, `work_type_code`, `hold_stat_code` 상세코드는 공통코드 목록에서 확인되지 않음
- `GET /api/common/code/select/{detail_code}`는 기존 코드도 상세 객체가 아니라 인증 메시지만 반환
- `POST /api/common/code/insert`는 `ref_val1/ref_val2` 사용 시 500
- `POST /api/common/code/insert`는 `reg_val1/reg_val2` 사용 시 성공 메시지는 오지만 목록 재조회에 반영되지 않음
- `POST /api/common/code/modify`는 실제 반영 여부 확인 불가
- `POST /api/common/code/delete/{detail_code}`는 성공 메시지 반환

현재 결정:

- 근태코드의 `isSchedulable`, `isExceptional`, `startDate`, `endDate`를 `etc` JSON으로 저장하는 방식은 아직 확정하지 않는다.
- 백엔드 저장 필드가 확정된 뒤 commonCode/attendanceCode adapter를 수정한다.

## 4. 시스템 설정 API

대상 API:

- `POST /api/system/setting/get`
- `POST /api/system/setting/modify`

현재 결과:

- `POST /api/system/setting/get` 호출 시 404 확인

확인 필요:

- API 구현 여부
- 요청/응답 DTO
- 일반 출퇴근 기준시간, 오전/오후 반차 기준시간 저장 가능 여부

## 5. 출퇴근 CSV/기록 API

대상 API:

- `POST /api/attend/manager/upload`
- `GET /api/attend/manager/select/week/{year}/{month}/{week}`
- `GET /api/attend/manager/select/month/{year}/{month}`
- `GET /api/attend/manager/select/year/{year}`

현재 결과:

- 2026-06-24 새 명세에서 주/월/년 단위 조회 API 구현 확인
- `POST /api/attend/manager/upload`에 제공된 `근태.csv` 업로드 성공
- 업로드 응답: `File uploaded successfully`
- `GET /api/attend/manager/select/month/2026/4` 응답 key: `attendmonthlist`
- 월 조회 결과: 최초 확인 442건, 동일 샘플 재업로드 후 940건까지 증가, 카드번호/날짜 기준 고유값은 163건
- 주요 응답 필드:
  - `attend_card_no`
  - `attend_record_date`
  - `attendance_time`
  - `leave_working_time`
  - `total_working`
  - `emp_no`

확인 필요:

- `emp_no` 필드에 사번이 아니라 이름이 내려오는 구조가 맞는지 확인
- 직원 매칭을 카드번호 기준으로 할지, 이름 기준으로 할지 확인
- 동일 파일 재업로드 시 카드번호 또는 직원 식별값 + 날짜 기준으로 update/upsert 처리되는지 확인
- XLSX 업로드도 CSV와 동일하게 지원하는지 확인
- 중복 저장이 누적되면 운영관리/현황통계에는 같은 직원-날짜의 출퇴근 시간이 여러 건 표시될 수 있으므로 백엔드 DB 기준 upsert 필요
