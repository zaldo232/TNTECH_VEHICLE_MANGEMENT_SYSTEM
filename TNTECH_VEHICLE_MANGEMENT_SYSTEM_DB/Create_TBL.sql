/**
 * @file        Create_TBL.sql
 * @description 차량 관리 시스템 핵심 테이블 정의 및 제약 조건 설정
 */

USE TNTECH_VEHICLE_MANGEMENT_SYSTEM
GO

-- 그룹 코드 관리 테이블 (코드 대분류)
CREATE TABLE TB_GROUPCODE (
    GROUP_CODE      NVARCHAR(50)    PRIMARY KEY,   -- 그룹 식별 코드 (예: BIZ_TYPE)
    GROUP_NAME      NVARCHAR(100)   NOT NULL,      -- 그룹 명칭 (예: 업무구분)
    DESCRIPTION     NVARCHAR(200)                  -- 그룹 상세 설명
);
GO

-- 공통 코드 관리 테이블 (상세 코드)
CREATE TABLE TB_COMMONCODE (
    GROUP_CODE      NVARCHAR(50)    NOT NULL,      -- 소속 그룹 코드 (FK)
    CONTENT_CODE    NVARCHAR(40)    NOT NULL,      -- 상세 코드값 (예: 01, AM)
    CODE_NAME       NVARCHAR(100),                 -- 코드 표시 명칭 (예: 오전, 납품)
    SORT_ORDER      INT             DEFAULT 0,     -- 정렬 순서
    
    CONSTRAINT PK_TB_COMMONCODE PRIMARY KEY (GROUP_CODE, CONTENT_CODE),
    CONSTRAINT FK_COMMON_GROUP FOREIGN KEY (GROUP_CODE) REFERENCES TB_GROUPCODE(GROUP_CODE) ON DELETE CASCADE
);
GO

-- 채번 관리 테이블 (ID 일련번호 생성용)
CREATE TABLE TB_LAST_SERIAL (
    BASE_DATE           NVARCHAR(20)    NOT NULL,  -- 기준 날짜 (예: H000_20260225)
    SERIAL_TYPE          NVARCHAR(20)    NOT NULL,  -- 일련번호 유형 (DISPATCH, HISTORY 등)
    LAST_SERIAL         INT             DEFAULT 0, -- 해당 날짜/유형의 마지막 번호
    
    CONSTRAINT PK_TB_LAST_SERIAL PRIMARY KEY (BASE_DATE, SERIAL_TYPE)
);
GO

-- 사용자 관리 테이블
CREATE TABLE TB_MEMBERS (
    MEMBER_ID           NVARCHAR(50)    PRIMARY KEY, -- 사원 번호 및 아이디
    MEMBER_NAME         NVARCHAR(50),                -- 이름
    DEPARTMENT          NVARCHAR(50),                -- 소속 부서
    MEMBER_PASSWORD     NVARCHAR(MAX),               -- 암호화된 비밀번호
    MEMBER_ROLE         NVARCHAR(50)                 -- 권한 수준 (공통코드 연결)
);
GO

-- 차량 마스터 테이블
CREATE TABLE TB_VEHICLES (
    LICENSE_PLATE       NVARCHAR(30)    PRIMARY KEY,    -- 차량 번호
    VEHICLE_NAME        NVARCHAR(50),                   -- 차종 명칭
    MILEAGE             INT             DEFAULT 0,      -- 현재 총 누적 주행거리
    VEHICLES_STATUS     NVARCHAR(20)    DEFAULT 'AVAILABLE', -- 현재 상태 (공통코드)
    IS_MANAGED          CHAR(1)         DEFAULT 'Y'     -- 정기 점검 관리 여부
);
GO

-- 항목별 점검 주기 설정 테이블
CREATE TABLE TB_MANAGEMENT_SETTINGS (
    LICENSE_PLATE    NVARCHAR(30) NOT NULL,            -- 차량 번호 (FK)
    MANAGEMENT_TYPE         NVARCHAR(40) NOT NULL,      -- 점검 항목 코드 (예: M01)
    INTERVAL_KM      INT DEFAULT 5000,                  -- 항목별 점검 권장 주기(km)
    
    CONSTRAINT PK_TB_MANAGEMENT_SETTINGS PRIMARY KEY (LICENSE_PLATE, MANAGEMENT_TYPE)
);
GO

-- 배차 관리 테이블 (신청 및 예약 현황)
CREATE TABLE TB_DISPATCH (
    DISPATCH_ID         NVARCHAR(50)    PRIMARY KEY,    -- 배차 고유 ID (D + 일련번호)
    MEMBER_ID           NVARCHAR(50),                   -- 신청자 ID
    LICENSE_PLATE       NVARCHAR(30),                   -- 신청 차량 번호
    DISPATCH_STATUS     NVARCHAR(20)    DEFAULT 'RESERVED', -- 상태 (RESERVED, RETURNED, CANCELED)
    
    RENTAL_DATE         DATETIME,                       -- 대여 시작 일시
    RENTAL_PERIOD       NVARCHAR(20),                   -- 대여 구분 (AM/PM/ALL)
    START_MILEAGE       INT NULL,                       -- 운행 시작 시 주행거리
    
    REGION              NVARCHAR(100),                  -- 운행 지역
    VISIT_PLACE         NVARCHAR(100),                  -- 방문 목적지
    BUSINESS_TYPE       NVARCHAR(50),                   -- 업무 구분 코드
    
    RETURN_DATE         DATETIME NULL,                  -- 실제 반납 일시
    END_MILEAGE         INT NULL,                       -- 운행 종료 시 주행거리
    COMMUTE_DISTANCE    INT             DEFAULT 0,      -- 운행 중 사적 이용(출퇴근) 거리
    
    -- 실제 업무 주행 거리 자동 계산 컬럼
    BUSINESS_DISTANCE AS (ISNULL(END_MILEAGE, 0) - ISNULL(START_MILEAGE, 0) - ISNULL(COMMUTE_DISTANCE, 0)),
    
    CREATED_AT          DATETIME DEFAULT GETDATE()      -- 데이터 생성 일시
);
GO

-- 차량 점검 및 정비 기록 테이블
CREATE TABLE TB_MANAGEMENT (
    MANAGEMENT_ID       NVARCHAR(50)    PRIMARY KEY,    -- 점검 고유 ID (M + 일련번호)
    LICENSE_PLATE       NVARCHAR(30),                   -- 대상 차량 번호
    MANAGEMENT_DATE     DATE,                           -- 점검 실시 일자
    MANAGEMENT_TYPE     NVARCHAR(50),                   -- 점검 항목 코드
    MANAGEMENT_DETAILS  NVARCHAR(MAX),                  -- 정비 상세 내용
    REPAIRSHOP          NVARCHAR(100),                  -- 정비소 명칭
    
    MILEAGE             INT,                            -- 점검 당시 주행거리
    NOTE                NVARCHAR(MAX),                  -- 특이사항 및 메모
    MANAGER_NAME        NVARCHAR(50),                   -- 점검 확인자/담당자
    
    CREATED_AT          DATETIME        DEFAULT GETDATE()
);
GO

-- 운행 및 상태 변경 이력 테이블
CREATE TABLE TB_HISTORY (
    RENTAL_HISTORY_ID   NVARCHAR(50)    PRIMARY KEY,    -- 이력 고유 ID (H + 일련번호)
    DISPATCH_ID         NVARCHAR(50),                   -- 참조 배차 ID
    
    VEHICLE_NAME        NVARCHAR(50),                   -- 당시 차량명
    MEMBER_ID           NVARCHAR(50),                   -- 관련 사원 ID
    MEMBER_NAME         NVARCHAR(50),                   -- 사원 이름
    ACTION_TYPE         NVARCHAR(20),                   -- 발생 이벤트 (신청, 수정, 반납, 취소)
    NOWROLE             NVARCHAR(20),                   -- 당시 사원 권한
    
    RENTAL_DATE         DATETIME,                       -- 대여 일시
    DUE_DATE            DATETIME,                       -- 반납 예정 일시
    START_MILEAGE       INT,                            -- 시작 거리
    REGION              NVARCHAR(100),                  -- 운행 지역
    VISIT_PLACE         NVARCHAR(100),                  -- 목적지
    BUSINESS_TYPE       NVARCHAR(50),                   -- 업무 구분
    
    RETURN_DATE         DATETIME NULL,                  -- 실제 반납 일시
    END_MILEAGE         INT NULL,                       -- 실제 종료 거리
    BUSINESS_DISTANCE   INT NULL,                       -- 실제 업무 주행 거리
    
    CREATED_AT          DATETIME        DEFAULT GETDATE()
);
GO

-- 세션 관리 테이블 (Node.js express-session 연동)
CREATE TABLE [dbo].[TB_SESSIONS](
    [sid] [varchar](255) NOT NULL PRIMARY KEY,          -- 세션 고유 식별자
    [session] [varchar](max) NOT NULL,                  -- 직렬화된 세션 데이터
    [expires] [datetime] NOT NULL                       -- 세션 만료 시간
);
GO