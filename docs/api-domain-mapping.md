# API 도메인 매핑

## 연결 기준

- 백엔드 서버: `http://192.168.0.191:8080`
- Swagger UI: `http://192.168.0.191:8080/swagger/`
- OpenAPI YAML: `http://192.168.0.191:8080/swagger/swagger.yaml`
- 개발 중 API base: `NEXT_PUBLIC_API_BASE_URL=/backend-api`
- 실제 백엔드 origin: `BACKEND_API_ORIGIN=http://192.168.0.191:8080`
- 데이터 소스 전환: `NEXT_PUBLIC_DATA_SOURCE=api`이면 API, 그 외에는 목데이터 사용
- 인증 방식: JWT 토큰 방식
- 브라우저 CORS 우회를 위해 개발 환경에서는 Next.js rewrite(`/backend-api`)를 사용

## 현재 연결 상태

| 프론트 도메인 | 백엔드 API | 프론트 파일 | 상태 |
| --- | --- | --- | --- |
| 로그인 | `POST /api/login` | `src/api/authApi.ts`, `src/repositories/authRepository.ts` | 연결 |
| 로그아웃 | `POST /api/logout` | `src/api/authApi.ts` | 래퍼 준비 |
| 사용자 | `/api/userinfo/*` | `src/api/userInfoApi.ts`, `src/repositories/userRepository.ts` | 조회/등록/수정/삭제 연결 구조 준비 |
| 직원 | `/api/employee/*` | `src/api/employeeApi.ts`, `src/repositories/employeeRepository.ts` | 조회/등록/수정/삭제 연결 구조 준비 |
| 직원 근태 | `/api/employee/attend/*` | `src/api/employeeApi.ts` | API 래퍼 준비 |
| 공통그룹 | `/api/common/group/*` | `src/api/commonCodeApi.ts`, `src/repositories/commonCodeRepository.ts` | 조회/등록/수정/삭제 래퍼 준비 |
| 공통코드 | `/api/common/code/*` | `src/api/commonCodeApi.ts`, `src/repositories/commonCodeRepository.ts` | 조회/등록/수정/삭제 래퍼 준비 |
| 근태코드 | `GET /api/common/code/select` | `src/repositories/attendanceCodeRepository.ts` | `G_ATTEND_STAT` 기준 조회 연결 |
| 출퇴근 파일/조회 | `/api/attend/manager/upload`, `/api/attend/manager/select/{week}` | `src/api/attendanceApi.ts`, `src/repositories/attendanceRecordRepository.ts` | 래퍼/조회 hook 준비, 백엔드 목록 응답 필요 |
| 현황통계 출퇴근 기록 | `/api/attend/manager/select/{week}` | `src/hooks/useAttendanceRecordQueries.ts`, `src/app/_components/reports/hooks/*` | API 목록이 있으면 API 사용, 빈 응답이면 확정 프론트 기록 fallback |
| 운영관리 단말기 기록 | `/api/attend/manager/select/{week}` | `src/hooks/useAttendanceRecordQueries.ts`, `src/app/_components/management/operations/hooks/useManagementOperationState.ts` | API 목록이 있으면 API 사용, 빈 응답이면 프론트 단말기 기록 fallback |
| 시스템 설정 | `/api/system/setting/get`, `/api/system/setting/modify` | `src/api/settingsApi.ts`, `src/repositories/settingsRepository.ts`, `src/hooks/useSettingsQueries.ts` | 화면 연결, 백엔드 404 시 프론트 기본값 fallback |

## 실제 응답 기준 메모

### 로그인

요청:

```json
{
  "logininfo": {
    "userid": "dev1",
    "password": "password123"
  }
}
```

Swagger 응답은 객체 구조지만 실제 응답은 배열 구조입니다.
프론트는 현재 두 구조를 모두 처리합니다.

### 사용자

`/api/userinfo/select/dev1` 실제 응답:

```json
{
  "userinfo": {
    "user_id": "dev1",
    "user_name": "Devel",
    "role_code": "ROLE_USER",
    "emp_no": "00000000"
  }
}
```

역할 매핑:

- `ROLE_SUPER`, `ROLE_ADMIN` -> `ADMIN`
- `ROLE_USER`, `ROLE_GENERAL` -> `GENERAL`
- `ROLE_SHIFT_MANAGER` -> `SHIFT_MANAGER`
- `ROLE_ORGANIZATION_MANAGER`, `ORG_MANAGER` -> `ORGANIZATION_MANAGER`
- `ROLE_EXECUTIVE` -> `EXECUTIVE`

### 직원

`/api/employee/select` 실제 응답은 `{ "employeelist": [...] }` 구조입니다.
직원 DTO의 주요 필드는 아래와 같습니다.

- `emp_no`
- `emp_name`
- `dept_code`
- `rank_code`
- `work_type_code`
- `hold_stat_code`
- `hire_date`
- `retire_date`

현재 `dept_code`, `rank_code`의 상세 코드가 공통코드 목록에 없어 화면에는 코드값이 그대로 보일 수 있습니다.
직원 저장 시에는 조회 때 받은 `dept_code`, `rank_code`, `work_type_code`, `hold_stat_code`를 도메인 모델에 보존해 다시 DTO로 전달합니다.
다만 신규 등록 시에는 부서/직급 선택값이 아직 백엔드 코드 체계와 완전히 맞지 않을 수 있어 공통코드 상세 데이터가 필요합니다.

### 공통코드

`/api/common/code/select` 실제 응답은 `{ "commoncodelist": [...] }` 구조입니다.
현재 확인된 주요 그룹:

- `G_ATTEND_STAT`: 근태코드
- `G_USER_LEVEL`: 권한 코드

근태코드에 필요한 `isSchedulable`, `isExceptional`, `startDate`, `endDate` 필드는 아직 백엔드 응답에 없습니다.

### 출퇴근 기록

`/api/attend/manager/select/{week}`는 여러 week 형식으로 테스트했으나 현재 실제 목록 대신 인증 성공 메시지만 반환합니다.

현재 프론트 처리:

- 배열 응답이면 그대로 사용
- `{ attendancelist: [...] }`, `{ attendanceList: [...] }`, `{ employeelist: [...] }`이면 목록으로 사용
- `{ status, message }`만 오면 빈 목록으로 처리

백엔드에서 실제 목록 응답이 확정되면 현황통계/운영관리 화면까지 연결할 수 있습니다.
현황통계의 출퇴근기록, 조건별 근태 이력, 직원별 근태 이력 화면은 API 조회 hook을 호출하도록 연결했습니다.
현재 백엔드가 실제 목록을 반환하지 않으므로 화면에서는 확정된 프론트 기록을 fallback으로 표시합니다.
운영관리 단말기 CSV 탭도 동일하게 API 조회 hook을 호출합니다.
현재 백엔드가 실제 목록을 반환하지 않으므로 화면에서는 프론트 단말기 기록을 fallback으로 표시합니다.

## 저장 API 테스트 순서

실제 서버 데이터가 변경될 수 있으므로 저장 테스트는 더미 데이터 기준을 정한 뒤 진행합니다.

1. 사용자 등록/수정/삭제
2. 직원 등록/수정/삭제
3. 근태코드 등록/수정/사용종료
4. 시스템 설정 조회/저장
5. 출퇴근 CSV 업로드

각 테스트에서 요청 body, 응답 body, 실패 메시지를 확인해 `docs/backend-request-list.md`에 반영합니다.

### 시스템 설정

기준시간 설정 화면은 `useWorkTimePolicyQuery`, `useUpdateWorkTimePolicyMutation`을 통해 시스템 설정 API를 호출합니다.
다만 실제 서버에서 `/api/system/setting/get`이 404를 반환하므로 현재 화면은 프론트 기본 기준시간을 표시합니다.
저장도 `/api/system/setting/modify` 구현이 필요합니다.

## 아직 백엔드 API가 필요한 영역

| 기능 | 필요한 API |
| --- | --- |
| 운영관리 주차 확정 | 주차 상태 조회, 최종 확정, 확정 취소, 이력 조회 |
| 사전 근태 일정 | 주차별 조회, 등록, 수정, 삭제 |
| 교대근무 일정 | 월/주차별 조회, 저장, 삭제, 선택 주차 확정/취소 |
| 공휴일 | 법정공휴일, 대체공휴일, 임시공휴일, 선거일 조회 |
| 주간보고서 | 확정 주차 보고서 저장/조회/출력 이력 |
| 조직 이력 | 부서, 구성원, 직책, 교대근무 여부의 날짜별 이력 |
| 근태 기록 이력 | 자동판정, 수동수정, CSV 원본, 변경 이벤트 이력 |
