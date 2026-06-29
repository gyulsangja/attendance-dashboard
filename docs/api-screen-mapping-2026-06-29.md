# 화면별 API 매핑표

기준 문서: `swagger (3).yaml`
작성일: 2026-06-29

## 분류 기준

- 기존 API 사용: Swagger에 있고 현재 화면 기능에 그대로 사용할 수 있는 API
- 기존 API 보강: Swagger에 있으나 응답 필드, 요청 방식, path, schema 보완이 필요한 API
- 신규 API 필요: Swagger에 없어서 백엔드에 추가 요청해야 하는 API

## 1. 로그인

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 로그인 | `POST /api/login` | 기존 API 사용 | JWT 토큰 저장, 로그인 처리 | token 안에 권한 정보 포함 여부 확인 |
| 로그아웃 | `POST /api/logout` | 기존 API 사용 | 토큰/세션 제거 | 요청 body 필요 여부 확인 |
| 로그인 사용자 권한 확인 | `GET /api/userinfo/select/{userid}` | 기존 API 사용 | 메뉴/권한 제어 | `role_code` 값과 프론트 권한 매핑 확정 |

## 2. 설정

### 2-1. 직원 정보 항목 관리

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 공통코드 목록 조회 | `GET /api/common/code/select` | 기존 API 사용 | 직급/근무유형/재직상태 목록 표시 | `group_code`별 필터링은 프론트에서 처리 가능 |
| 직급/근무유형/재직상태 등록 | `POST /api/common/code/insert` | 기존 API 사용 | 설정 화면 항목 추가 | `commoncodeinfo` body 유지 |
| 직급/근무유형/재직상태 수정 | `POST /api/common/code/modify` | 기존 API 사용 | 설정 화면 항목 수정 | 저장 후 재조회 시 반영 필요 |
| 직급/근무유형/재직상태 삭제 | `POST /api/common/group/delete/{detail_code}` | 기존 API 보강 | 설정 화면 항목 삭제 | path를 `/api/common/code/delete/{detail_code}`로 수정 요청 |

사용 그룹:

```txt
G_RANK_CODE      직급
G_WORK_TYPE      근무유형
G_HOLD_STATUS    재직상태
```

### 2-2. 근태코드 관리

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 근태코드 조회 | `GET /api/common/code/select` | 기존 API 사용 | `G_ATTEND_STAT`만 필터링해 표시 | `ref_val1`, `ref_val2` 응답 필요 |
| 근태코드 등록 | `POST /api/common/code/insert` | 기존 API 보강 | 근태코드 추가 | Swagger insert에 `ret_val1/ret_val2`로 표기되어 있음. `ref_val1/ref_val2`로 통일 요청 |
| 근태코드 수정 | `POST /api/common/code/modify` | 기존 API 사용 | 근태코드명, 사용 여부, 옵션 수정 | `ref_val1/ref_val2` 저장 필요 |
| 근태코드 삭제/사용중지 | `POST /api/common/group/delete/{detail_code}` | 기존 API 보강 | 사용중지 또는 삭제 | path 수정 또는 사용중지 정책 확정 필요 |

근태코드 필드 사용:

```txt
group_code        G_ATTEND_STAT
detail_code       프론트 자동생성 관리코드
detail_code_name  근태코드명
use_status        사용 여부 Y/N
ref_val1          운영관리 입력 가능 여부 Y/N
ref_val2          특이근태 표시 여부 Y/N
sort_order        정렬순서
etc               비고
```

### 2-3. 근무시간 설정

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 기준시간 조회 | `POST /api/system/setting/get` | 기존 API 보강 | 설정 화면 초기값 | Swagger schema가 login 예시로 되어 있어 실제 schema 수정 필요 |
| 기준시간 저장 | `POST /api/system/setting/modify` | 기존 API 보강 | 기준시간 저장 | 아래 필드 저장/조회 필요 |

필요 필드:

```txt
regularStart
regularEnd
halfAmStart
halfAmEnd
halfPmStart
halfPmEnd
```

## 3. 직원/조직관리

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 직원 목록 조회 | `GET /api/employee/select` | 기존 API 보강 | 직원 목록/조직관리 화면 | 표시명 필드 보강 필요 |
| 직원 상세 조회 | `GET /api/employee/select/{emp_no}` | 기존 API 사용 | 직원 수정 팝업 초기값 | 응답 구조 확인 필요 |
| 직원 등록 | `POST /api/employee/insert` | 기존 API 보강 | 신규 직원 등록 | `attend_card_no`, `shift_yn` 필드 필요 |
| 직원 수정 | `POST /api/employee/modify` | 기존 API 보강 | 직원 정보 수정 | `attend_card_no`, `shift_yn`, `retire_date` 저장 필요 |
| 직원 삭제 | `POST /api/employee/delete/{emp_no}` | 기존 API 사용 | 직원 삭제 | 실제 삭제/사용중지 정책 확인 |

직원 화면 필요 필드:

```txt
emp_company
emp_no
emp_name
dept_code
dept_name
rank_code
rank_name
work_type_code
work_type_name
hold_stat_code
hold_stat_name
shift_yn
attend_card_no
email
phone_no
hire_date
retire_date
etc
```

## 4. 사용자관리

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 사용자 목록 조회 | `GET /api/userinfo/select` | 기존 API 사용 | 사용자관리 목록 | `role_code`, `acct_stat_code` 표시 |
| 사용자 상세 조회 | `GET /api/userinfo/select/{userid}` | 기존 API 사용 | 사용자 수정 팝업 | 응답 key 확인 필요 |
| 사용자 등록 | `POST /api/userinfo/insert` | 기존 API 사용 | 사용자 등록 | 권한 코드 확정 필요 |
| 사용자 수정 | `POST /api/userinfo/modify` | 기존 API 사용 | 사용자 수정 | 비밀번호 변경 정책 확인 |
| 사용자 삭제 | `POST /api/userinfo/delete/{userid}` | 기존 API 사용 | 사용자 삭제 | 실제 삭제/비활성 정책 확인 |

권한 코드 제안:

```txt
ROLE_ADMIN
ROLE_EXECUTIVE
ROLE_ORGANIZATION_MANAGER
ROLE_SHIFT_MANAGER
ROLE_GENERAL
```

## 5. 운영관리

### 5-1. 근태 일정

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 근태 일정 조회 | `POST /api/employee/attend/select/items` | 기존 API 보강 | 선택 주차 상단 건수, 하단 일정 리스트 | 기간 조건 조회와 응답 보강 필요 |
| 근태 일정 등록 | `POST /api/employee/attend/insert` | 기존 API 사용 | 일정 등록 | 확정 주차 수정 불가 정책 필요 |
| 근태 일정 수정 | `POST /api/employee/attend/modify` | 기존 API 사용 | 일정 수정 | `id` 또는 `emp_no + attend_date + attend_code` 기준 확정 필요 |
| 근태 일정 삭제 | `POST /api/employee/attend/delete/{emp_no}` | 기존 API 보강 | 일정 삭제 | 개별 일정 삭제 기준 필요. 직원 전체 삭제인지 확인 필요 |

조회 요청값:

```txt
start_date
end_date
emp_no
dept_code
attend_code 또는 detail_code
```

조회 응답 보강:

```txt
year
month
week
startDate
endDate
totalCount
items[]
```

items 필요 필드:

```txt
id
emp_no
emp_name
dept_code
dept_name
rank_code
rank_name
attend_date
attend_code
attend_code_name
start_time
end_time
memo
```

### 5-2. 단말기 CSV / 출퇴근 기록

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 파일 업로드 | `POST /api/attend/manager/upload` | 기존 API 사용 | CSV/XLSX 업로드 | 백엔드가 덮어쓰기/자동판정 처리 |
| 주차 조회 | `GET /api/attend/manager/select/week/{year}/{month}/{week}` | 기존 API 보강 | 선택 주차 입력 건수, 일자별 출퇴근 기록 | `deviceTimeCount`, `items[]` 응답 필요 |
| 출퇴근 수정 | `GET /api/attend/manager/modify` | 기존 API 보강 | 출퇴근 시간 수동수정 | `POST /api/attend/manager/modify`로 변경 요청 |
| 주차 삭제 | `POST /api/attend/manager/delete/week` | 기존 API 사용 | 선택 주차 출퇴근 기록 삭제 | 확정 주차 삭제 불가 정책 필요 |
| 직원+주차 삭제 | `POST /api/attend/manager/delete/emp_no` | 기존 API 사용 | 특정 직원 기록 삭제 | 확정 주차 삭제 불가 정책 필요 |

주차 조회 응답 보강:

```txt
year
month
week
startDate
endDate
totalCount
deviceTimeCount
items[]
```

`deviceTimeCount` 기준:

```txt
check_in 또는 check_out이 실제로 있는 기록 수
자동 생성 결근은 제외
```

items 필요 필드:

```txt
id
emp_no
emp_name
dept_code
dept_name
rank_code
rank_name
attend_card_no
attend_date
check_in
check_out
attend_code
attend_code_name
attend_reason
memo
source
```

### 5-3. 교대근무

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 월간 교대근무 일정 조회 | 없음 | 신규 API 필요 | 운영관리 월간 달력 표시 | 신규 요청 |
| 교대근무 일정 저장 | 없음 | 신규 API 필요 | 일정 추가/수정/덮어쓰기 | 신규 요청 |
| 교대근무 일정 삭제 | 없음 | 신규 API 필요 | 일정 삭제 | 신규 요청 |
| 선택 주차 교대근무 확정상태 조회 | 없음 | 신규 API 필요 | 확정 버튼/수정 잠금 | 신규 요청 |
| 선택 주차 교대근무 확정 | 없음 | 신규 API 필요 | 주차 확정 | 신규 요청 |
| 선택 주차 교대근무 확정취소 | 없음 | 신규 API 필요 | 확정 취소 | 신규 요청 |

필요 API:

```txt
GET  /api/shift/schedule/month/{year}/{month}
POST /api/shift/schedule/save
POST /api/shift/schedule/delete
GET  /api/shift/week/status/{year}/{month}/{week}
POST /api/shift/week/confirm
POST /api/shift/week/cancel
```

### 5-4. 운영관리 최종 확정

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 주차 확정상태 조회 | 없음 | 신규 API 필요 | 화면 잠금, 확정 여부 표시 | 신규 요청 |
| 운영관리 최종 확정 | 없음 | 신규 API 필요 | 확정 처리 | 신규 요청 |
| 운영관리 확정취소 | 없음 | 신규 API 필요 | 확정 취소 후 수정 | 신규 요청 |

필요 API:

```txt
GET  /api/operation/week/status/{year}/{month}/{week}
POST /api/operation/week/confirm
POST /api/operation/week/cancel
```

상태 응답 필요 필드:

```txt
year
month
week
startDate
endDate
operationConfirmedYn
confirmedAt
confirmedBy
editableYn
```

## 6. 대시보드

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 주차 확정 여부 | 신규 운영관리 확정 API | 신규 API 필요 | 확정 데이터 카드 표시 여부 | `/api/operation/week/status` 필요 |
| 주간 출퇴근 요약 | `GET /api/attend/manager/select/week/{year}/{month}/{week}` | 기존 API 보강 | 확정 주차 요약 카드 | 근태코드명 포함 필요 |
| 주간 계획/특별 근태 | `POST /api/employee/attend/select/items` | 기존 API 보강 | 계획/특별 근태 표 | 기간 조건 조회 필요 |
| 교대근무 주간 일정 | 신규 교대근무 API | 신규 API 필요 | 주간 달력 | 월간 조회 후 프론트 필터 가능 |

## 7. 현황통계

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 월간 출퇴근 기록 | `GET /api/attend/manager/select/month/{year}/{month}` | 기존 API 보강 | 월간 기록 표 | 부서명, 직급명, 근태코드명 필요 |
| 연간 출퇴근 기록 | `GET /api/attend/manager/select/year/{year}` | 기존 API 보강 | 연간/조건 통계 | 부서명, 직급명, 근태코드명 필요 |
| 조건별 근태 일정 | `POST /api/employee/attend/select/items` | 기존 API 보강 | 조건별 목록/달력 | 기간, 직원, 부서, 코드 조건 필요 |
| 확정 여부 | 신규 운영관리 확정 API | 신규 API 필요 | 확정 데이터 표시 기준 | `/api/operation/week/status` 필요 |

## 8. 공휴일 관리

| 기능 | 기존 API | 분류 | 프론트 사용 | 확인/요청 사항 |
|---|---|---|---|---|
| 공휴일 조회 | 없음 | 신규 API 필요 | 공휴일/임시공휴일 화면 및 자동판정 기준 | 신규 요청 |
| 공휴일 등록 | 없음 | 신규 API 필요 | 임시공휴일/선거일 추가 | 신규 요청 |
| 공휴일 수정 | 없음 | 신규 API 필요 | 명칭/유형 수정 | 신규 요청 |
| 공휴일 삭제 | 없음 | 신규 API 필요 | 임시공휴일 삭제 | 신규 요청 |

필요 API:

```txt
GET  /api/holiday/select/{year}
POST /api/holiday/insert
POST /api/holiday/modify
POST /api/holiday/delete/{holiday_id}
```

## 9. 백엔드 요청 우선순위

1. 기존 API 오류/스키마 보정
   - 공통코드 삭제 path 수정
   - `ref_val1/ref_val2` 필드명 통일
   - 출퇴근 수정 API `POST` 전환
   - 시스템 설정 API schema 수정

2. 기존 API 응답 보강
   - 직원정보 `attend_card_no`, `shift_yn`, 표시명 필드
   - 근태 일정 조건조회 `totalCount`, `items[]`, 표시명 필드
   - 출퇴근 주차조회 `deviceTimeCount`, `items[]`, 표시명 필드

3. 신규 API 추가
   - 교대근무 API
   - 운영관리 최종 확정 API
   - 공휴일 API