# 공통코드 API 테스트 결과

테스트 일자: 2026-06-24

오늘 범위는 공통코드 기준 데이터 확인으로 제한한다. 운영관리, CSV, 확정 API는 진행하지 않는다.

## 1. 공통코드 그룹 목록 조회

- API: `GET /api/common/group/select`
- 결과: 성공
- 응답 key: `groupcodelist`

확인된 그룹:

| group_code | 용도 |
| --- | --- |
| `G_ATTEND_STAT` | 근태상태구분 |
| `G_CODE_1234` | 테스트성 그룹으로 보임 |
| `G_LEAVE_TYPE` | 휴가종류구분 |
| `G_RANK_CODE` | 직급구분 |
| `G_TEAM_CODE` | 부서코드 |
| `G_USER_LEVEL` | 사용자구분 |

프론트 기대 그룹과 비교:

| 필요 기준 | 확인 결과 |
| --- | --- |
| 부서 | `G_TEAM_CODE` 그룹은 있음 |
| 직급 | `G_RANK_CODE` 그룹은 있음 |
| 근무유형 | 별도 그룹 미확인 |
| 재직상태 | 별도 그룹 미확인 |
| 권한 | `G_USER_LEVEL` 그룹 있음 |
| 근태코드 | `G_ATTEND_STAT` 그룹 있음 |

## 2. 공통코드 상세 목록 조회

- API: `GET /api/common/code/select`
- 결과: 성공
- 응답 key: `commoncodelist`

확인된 상세코드 그룹:

| group_code | 상세코드 수 | 비고 |
| --- | ---: | --- |
| `G_ATTEND_STAT` | 7 | 근태코드 목록 확인 |
| `G_USER_LEVEL` | 4 | 권한 코드 목록 확인 |

문제:

- `G_TEAM_CODE`, `G_RANK_CODE` 그룹은 있으나 상세코드 목록에는 부서/직급 상세코드가 내려오지 않음
- 직원 등록에 필요한 `dept_code`, `rank_code`, `work_type_code`, `hold_stat_code` 선택값을 프론트가 공통코드 API로 구성할 수 없음
- 테스트에 사용했던 `TTT12`, `DDD123`, `USE`, `TEE1` 값은 공통코드 상세 목록에서 확인되지 않음

## 3. 공통그룹 상세 조회

- API: `GET /api/common/group/select/{group_code}`
- 결과: 성공
- 응답 key: `groupcodelist`

확인:

- `G_ATTEND_STAT` 상세 조회 정상
- `G_TEAM_CODE` 상세 조회 정상

## 4. 공통코드 상세 조회

- API: `GET /api/common/code/select/{detail_code}`
- 결과: 실패로 판단
- 테스트 코드: `ATT01`, `ATT02`, `ROLE_USER`
- 실제 응답:

```json
{
  "status": "authorized",
  "message": "JWT Token valid."
}
```

문제:

- 기존에 목록에 존재하는 상세코드도 상세 객체가 반환되지 않음
- Swagger의 `commoncoderesult` 구조와 다름

## 5. 공통코드 등록

- API: `POST /api/common/code/insert`
- 테스트 코드: `FE_TEST_COMMON`

### `ref_val1/ref_val2` 요청

- 결과: 실패
- HTTP status: 500

### `reg_val1/reg_val2` 요청

- 결과: API 응답은 성공
- 응답 메시지: `공통코드그룹 등록 성공`
- DB 반영 여부: 목록 재조회에서 `FE_TEST_COMMON` 미확인

문제:

- `reg_val1/reg_val2`로 보내면 200/성공 메시지는 오지만 목록에 반영되지 않음
- 성공 메시지가 공통코드가 아니라 공통코드그룹 등록 성공으로 나옴
- `ref_val1/ref_val2`와 `reg_val1/reg_val2` 중 실제 저장 기준 확정 필요

## 6. 공통코드 수정

- API: `POST /api/common/code/modify`
- 결과: API 응답은 성공 또는 인증 메시지
- DB 반영 여부: 등록 데이터가 목록에 없어서 반영 확인 불가

문제:

- 수정 API도 실제 데이터 변경 여부를 목록 재조회로 확인할 수 없음

## 7. 공통코드 삭제

- API: `POST /api/common/code/delete/{detail_code}`
- 결과: 성공 메시지 반환
- DB 반영 여부: 테스트 코드가 목록에 반영되지 않아 삭제 반영 여부는 실질 확인 불가

## 8. 근태코드 추가 속성

프론트 근태코드에는 아래 속성이 필요하다.

- `isSchedulable`: 운영관리에서 일정 입력 가능 여부
- `isExceptional`: 대시보드 특이근태 표시 여부
- `startDate`: 적용 시작일
- `endDate`: 적용 종료일

현재 결론:

- 백엔드 공통코드 응답에는 위 속성 전용 필드가 없다.
- `etc`에 JSON을 임의 저장하는 방식은 아직 확정하지 않는다.
- 소장님께 저장 필드를 먼저 확인한 뒤 adapter를 확정한다.

## 9. 백엔드 확인 필요 요약

- 부서/직급/근무유형/재직상태 상세코드 제공 방식
- `TTT12`, `DDD123`, `USE`, `TEE1`이 실제 운영 코드인지 테스트 코드인지
- 공통코드 상세 조회 API가 상세 객체를 반환하지 않는 문제
- 공통코드 등록 API가 200을 반환해도 목록에 반영되지 않는 문제
- `ref_val1/ref_val2`와 `reg_val1/reg_val2` 중 기준 필드명 확정
- 근태코드 추가 속성 저장 방식 확정


## 10. 2026-06-25 ?? ?? ?? ???

??? `(4)` ???? ??? ???? ?????.

### ?? ??

- `G_WORK_TYPE`, `G_HOLD_STATUS` ?? ?? ?? ??: 200
- ??? ?? `groupcodelist`? ? ??? ???

### ???? ??

Swagger ??? ?? `reg_val1/reg_val2`, integer `sort_order`? ????? ?? ???? ???.

- ??/??/????/???? ???? ?? ?? ??: 200
- ?? ???: `?????? ?? ??`
- ??? ??:
  - `G_TEAM_CODE`? `detail_code`? ? ?? `????` 1?? ??
  - `G_RANK_CODE`, `G_WORK_TYPE`, `G_HOLD_STATUS` ????? ???? ??

??:

- ???? ???? ?? API? 200? ????? ?? ?? ??? ????? ??
- ???? ?? ??? ??? insert ?? ?? ??? ?? ?? ??
- ??? DTO/adapter? ?? ?? `ref_val1/ref_val2`? ?? ??? `reg_val1/reg_val2`? ?? ????? ??
