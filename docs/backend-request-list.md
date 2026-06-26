# 백엔드 요청사항 정리

프론트는 현재 Next.js rewrite(`/backend-api`)를 통해 백엔드 API를 호출한다.
아래 항목은 실제 Swagger와 호출 결과를 비교해 백엔드에 확인 또는 보완 요청이 필요한 내용이다.

## 1. CORS 설정

브라우저에서 백엔드 API를 직접 호출하려면 CORS 허용이 필요하다.
현재 프론트는 임시로 Next.js rewrite로 우회 중이다.

요청:

- 허용 Origin: `http://localhost:3000`, `http://localhost:3001`
- 허용 Methods: `GET, POST, PUT, DELETE, OPTIONS`
- 허용 Headers: `Content-Type, Authorization`

## 2. 로그인 응답 구조 통일

Swagger 응답:

```json
{
  "loginresult": {
    "status": "Login Success",
    "token": "..."
  }
}
```

실제 응답:

```json
[["login result", ["status", "Login Success"], ["token", "..."]]]
```

요청:

- Swagger와 같은 객체 구조로 통일
- 토큰 필드는 `loginresult.token` 또는 `accessToken`처럼 명확한 필드로 반환

## 3. 권한 코드 확정

현재 확인된 백엔드 권한:

- `ROLE_SUPER`
- `ROLE_USER`
- 공통코드 `G_USER_LEVEL`: `ROLE_ADMIN`, `ROLE_GUEST`, `ROLE_SUPER`, `ROLE_USER`

프론트 정책:

- `ADMIN`, `EXECUTIVE`, `ORGANIZATION_MANAGER`: 전체 권한
- `SHIFT_MANAGER`: 교대근무 일정 입력/수정/삭제/선택주차 확정 가능, 운영관리 최종 확정 불가
- `GENERAL`: 조회 중심

요청:

- 백엔드 권한 코드와 프론트 권한 정책 매핑 확정
- 필요 시 `ROLE_SHIFT_MANAGER`, `ROLE_ORGANIZATION_MANAGER`, `ROLE_EXECUTIVE` 추가

현재 프론트 임시 매핑:

- `ADMIN`, `EXECUTIVE`, `ORGANIZATION_MANAGER` -> `ROLE_SUPER`
- `SHIFT_MANAGER`, `GENERAL` -> `ROLE_USER`

## 4. 사용자 API

확인 결과:

- 사용자 등록/조회/삭제는 정상 동작 확인
- 사용자 수정은 200 응답이 오지만 실제 데이터가 변경되지 않음
- 등록 성공 메시지가 `"공통코드그룹 등록 성공"`으로 반환됨

정상 등록 DTO:

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

요청:

- `POST /api/userinfo/modify` 실제 수정 반영 확인
- 사용자 등록 성공 메시지를 사용자 API에 맞게 수정
- Swagger의 `userinfoflist`와 실제 `userinfolist` 응답 key 통일
- 응답의 `acct_stat_code`와 요청의 `acc_stat_code` 필드명 통일 여부 결정

## 5. 직원 관련 코드 데이터

직원 조회 API는 아래 코드값을 반환한다.

- `dept_code`
- `rank_code`
- `work_type_code`
- `hold_stat_code`

2026-06-24 공통코드 조회 결과:

- 공통그룹 목록에는 `G_TEAM_CODE`, `G_RANK_CODE`가 있음
- 공통코드 상세 목록에는 `G_TEAM_CODE`, `G_RANK_CODE` 상세코드가 내려오지 않음
- 근무유형, 재직상태에 해당하는 공통그룹은 확인되지 않음
- 직원 등록 테스트에 사용한 `TTT12`, `DDD123`, `USE`, `TEE1`은 공통코드 상세 목록에서 확인되지 않음

요청:

- 부서 코드 상세 등록: `G_TEAM_CODE`
- 직급 코드 상세 등록: `G_RANK_CODE`
- 근무유형 코드 그룹/상세 제공
- 재직상태 코드 그룹/상세 제공
- 현재 테스트값 `TTT12`, `DDD123`, `USE`, `TEE1`이 실제 운영 코드인지 테스트 코드인지 확인
- 직원 등록/수정 필수 필드와 wrapper 구조 확정
- 직원 삭제 method가 Swagger처럼 `POST`인지, 기존 명세처럼 `DELETE`인지 확정

추가 확인 결과:

- 직원 등록은 `{ "newemployeeinfo": ... }` wrapper 사용 시 정상 동작
- wrapper 없이 DTO를 바로 보내면 500 발생
- 직원 삭제는 `POST /api/employee/delete/{emp_no}`로 정상 동작
- 직원 상세 조회 `GET /api/employee/select/{emp_no}`는 직원 상세가 아니라 인증 성공 메시지만 반환
- 직원 수정 `POST /api/employee/modify`는 200 응답이 오지만 목록 조회 결과가 변경되지 않음

요청:

- 직원 상세 조회 응답에 `employeedetailinfo` 또는 명확한 직원 객체 반환
- 직원 수정 API 실제 DB 반영 확인
- 수정 성공/실패 응답 메시지 반환

## 6. 근태코드 확장 필드

프론트 근태코드에는 아래 설정이 필요하다.

- 운영관리 일정 입력 가능 여부: `isSchedulable`
- 대시보드 특이근태 표시 여부: `isExceptional`
- 적용 시작일: `startDate`
- 적용 종료일: `endDate`

요청:

- 공통코드에 확장 필드를 추가할지, 별도 근태코드 설정 API를 제공할지 결정
- Swagger에는 `reg_val1`, `reg_val2`, 조회 예시에는 `ref_val1`, `ref_val2`가 섞여 있어 필드명 통일 필요

2026-06-24 공통코드 테스트 결과:

- `GET /api/common/group/select`는 `groupcodelist`로 정상 반환
- `GET /api/common/code/select`는 `commoncodelist`로 정상 반환
- `GET /api/common/code/select/{detail_code}`는 기존 코드도 상세 객체가 아니라 인증 메시지만 반환
- `POST /api/common/code/insert`는 `ref_val1/ref_val2` 사용 시 500 발생
- `POST /api/common/code/insert`는 `reg_val1/reg_val2` 사용 시 성공 메시지는 오지만 목록 재조회에 반영되지 않음
- 공통코드 등록 성공 메시지가 `"공통코드그룹 등록 성공"`으로 반환됨

요청:

- 공통코드 상세 조회 API가 `commoncoderesult` 또는 명확한 공통코드 객체를 반환하도록 수정
- 공통코드 등록 API의 실제 DB 반영 여부 확인
- 공통코드 등록/수정 성공 메시지를 API 기능에 맞게 수정
- `ref_val1/ref_val2`와 `reg_val1/reg_val2` 중 실제 요청/응답 기준 필드명 확정
- 근태코드의 `isSchedulable`, `isExceptional`, `startDate`, `endDate` 저장 위치 확정

## 7. 시스템 설정 API

Swagger에는 아래 API가 있으나 실제 호출 시 404를 반환한다.

- `POST /api/system/setting/get`
- `POST /api/system/setting/modify`

프론트에 필요한 설정:

- 일반 근무 출근 기준시간
- 일반 근무 퇴근 기준시간
- 오전반차 기준시간
- 오후반차 기준시간

요청:

- API 구현 여부 확인
- 실제 요청/응답 DTO 제공
- 저장 후 재조회 가능한 구조 필요

## 8. 운영관리 주차 확정 API

현재 Swagger에 운영관리 주차 확정/취소 API가 없다.

필요 API:

- 주차별 운영관리 상태 조회
- 주차 최종 확정
- 주차 확정 취소
- 확정/취소 이력 조회

정책:

- 최종 확정된 주차는 근태 일정, 단말기 CSV, 출퇴근 기록, 교대근무 수정 불가
- 수정하려면 확정 취소 후 가능
- 최종 확정 시 해당 주차 교대근무도 확정 상태로 맞춤

## 9. 교대근무 일정 API

현재 Swagger에 교대근무 일정 API가 없다.

필요 API:

- 주차별 교대근무 일정 조회
- 교대근무 일정 저장
- 교대근무 일정 삭제
- 선택 주차 교대근무 확정
- 선택 주차 교대근무 확정 취소

## 10. 사전 근태 일정 API

운영관리에서 연차, 병가, 재택, 반차 등 사전 근태 일정을 입력한다.

필요 API:

- 주차별 사전 근태 일정 조회
- 사전 근태 일정 등록/수정/삭제
- 확정 주차 수정 차단

## 11. 공휴일 기준

프론트는 대한민국 법정공휴일, 대체공휴일, 임시공휴일, 선거일 기준으로 자동 결근 제외 처리를 한다.

요청:

- 백엔드 공휴일 API 제공 여부 결정
- 프론트 목데이터 기준을 유지할지 결정

## 12. 출퇴근 조회 API

2026-06-24 새 API 명세에서 출퇴근 업로드와 주/월/년 조회 API 구현을 확인했다.

구현 확인 API:

- `POST /api/attend/manager/upload`
- `GET /api/attend/manager/select/week/{year}/{month}/{week}`
- `GET /api/attend/manager/select/month/{year}/{month}`
- `GET /api/attend/manager/select/year/{year}`

실제 확인 결과:

- 제공된 `근태.csv` 업로드 성공
- 업로드 응답: `File uploaded successfully`
- 월 조회 `GET /api/attend/manager/select/month/2026/4` 성공
- 월 조회 응답 key: `attendmonthlist`
- 월 조회 결과: 최초 확인 442건, 동일 샘플 재업로드 후 940건까지 증가, 카드번호/날짜 기준 고유값은 163건
- 중복 업로드 시 기존 출퇴근 시간이 덮어써지지 않고 누적 저장되는 현상 확인

요청:

- `emp_no` 필드에 사번이 아니라 이름이 내려오는 구조가 맞는지 확인
- 직원 매칭 기준을 카드번호(`attend_card_no`)로 할지 이름(`emp_no`)으로 할지 확정
- 출입통제 업로드는 카드번호 또는 직원 식별값 + 날짜 기준으로 기존 출퇴근 시간이 있으면 insert가 아니라 update/upsert 처리 필요
- XLSX 업로드 지원 여부 확인
- 응답 한글 인코딩이 브라우저에서도 정상 표시되는지 확인

프론트 임시 처리:

- 백엔드가 중복 row를 내려줘도 화면에서는 `employeeId-date` 기준으로 마지막 응답값만 표시하도록 보정
- 단, DB 누적 자체는 백엔드에서 upsert로 정리 필요

---

Latest working checklist: [backend-collaboration-checklist.md](./backend-collaboration-checklist.md)

