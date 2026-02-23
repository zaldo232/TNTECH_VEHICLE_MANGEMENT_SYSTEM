USE TNTECH_VEHICLE_MANGEMENT_SYSTEM
GO

-- 그룹 코드 관리 테이블
CREATE TABLE TB_GROUPCODE (
    GROUP_CODE      NVARCHAR(50)    PRIMARY KEY,   -- 예: BIZ_TYPE, VEHICLE_STATUS
    GROUP_NAME      NVARCHAR(100)   NOT NULL,      -- 예: 업무구분, 차량상태
    DESCRIPTION     NVARCHAR(200)                  -- 설명 (옵션)
);
GO

-- 공통 코드 관리 테이블 (GROUP_CODE를 FK로 설정)
CREATE TABLE TB_COMMONCODE (
    GROUP_CODE      NVARCHAR(50)    NOT NULL,
    CONTENT_CODE    NVARCHAR(40)    NOT NULL,      -- 예: 01, AVAILABLE
    CODE_NAME       NVARCHAR(100),                 -- 예: 납품, 대여 가능
    SORT_ORDER      INT             DEFAULT 0,
    
    CONSTRAINT PK_TB_COMMONCODE PRIMARY KEY (GROUP_CODE, CONTENT_CODE),
    CONSTRAINT FK_COMMON_GROUP FOREIGN KEY (GROUP_CODE) REFERENCES TB_GROUPCODE(GROUP_CODE) ON DELETE CASCADE
);
GO

-- [채번 관리]
CREATE TABLE TB_LAST_SERIAL (
    BASE_DATE           NVARCHAR(20)    NOT NULL,               -- 예: H000_YYYYMMDD
    SERIAL_TYPE         NVARCHAR(20)    NOT NULL,               -- DISPATCH, HISTORY, MANAGEMENT 등
    LAST_SERIAL         INT             DEFAULT 0,
    
    CONSTRAINT PK_TB_LAST_SERIAL PRIMARY KEY (BASE_DATE, SERIAL_TYPE)
);
GO

-- [사용자]
CREATE TABLE TB_MEMBERS (
    MEMBER_ID           NVARCHAR(50)    PRIMARY KEY,
    MEMBER_NAME         NVARCHAR(50),
    DEPARTMENT          NVARCHAR(50),
    MEMBER_PASSWORD     NVARCHAR(MAX),
    MEMBER_ROLE         NVARCHAR(50)                            -- 공통코드 관리 (프로, 팀장 등)
);
GO

-- [차량] : 단일 점검주기 컬럼 삭제 및 관리여부 유지
CREATE TABLE TB_VEHICLES (
    LICENSE_PLATE       NVARCHAR(30)    PRIMARY KEY,            -- 차량번호 (PK)
    VEHICLE_NAME        NVARCHAR(50),
    MILEAGE             INT             DEFAULT 0,              -- 최종 총 주행거리
    VEHICLES_STATUS     NVARCHAR(20)    DEFAULT 'AVAILABLE',    -- 공통코드 관리
    IS_MANAGED          CHAR(1)         DEFAULT 'Y'             -- 점검 관리 대상 여부 (Y/N)
);
GO

-- [점검 주기 설정] : 항목별 다중 관리를 위한 신규 테이블
CREATE TABLE TB_MANAGEMENT_SETTINGS (
    LICENSE_PLATE    NVARCHAR(30) NOT NULL,                     -- 차량번호 (FK)
    MANAGEMENT_TYPE         NVARCHAR(40) NOT NULL,               -- 점검내용 코드 (공통코드 '점검내용')
    INTERVAL_KM      INT DEFAULT 5000,                          -- 해당 항목 점검 주기 (km)
    
    CONSTRAINT PK_TB_MANAGEMENT_SETTINGS PRIMARY KEY (LICENSE_PLATE, MANAGEMENT_TYPE)
);
GO

-- [배차 관리]
CREATE TABLE TB_DISPATCH (
    DISPATCH_ID         NVARCHAR(50)    PRIMARY KEY,            -- PK (D000_20260311)
    MEMBER_ID           NVARCHAR(50),                           -- 신청자
    LICENSE_PLATE       NVARCHAR(30),                           -- 차량번호
    DISPATCH_STATUS     NVARCHAR(20)    DEFAULT 'RESERVED',     -- 상태 (RESERVED, RETURNED, CANCELED)
    
    RENTAL_DATE         DATETIME,                               -- 시작일시
    RENTAL_PERIOD       NVARCHAR(20),                           -- AM, PM, ALL
    START_MILEAGE       INT NULL,                               -- 출발거리
    
    REGION              NVARCHAR(100),                          -- 지역
    VISIT_PLACE         NVARCHAR(100),                          -- 방문처
    BUSINESS_TYPE       NVARCHAR(50),                           -- 업무구분
    
    RETURN_DATE         DATETIME NULL,                          -- 반납일시
    END_MILEAGE         INT NULL,                               -- 도착거리
    COMMUTE_DISTANCE    INT             DEFAULT 0,              -- 출퇴근거리
    
    BUSINESS_DISTANCE AS (ISNULL(END_MILEAGE, 0) - ISNULL(START_MILEAGE, 0) - ISNULL(COMMUTE_DISTANCE, 0)),
    
    CREATED_AT          DATETIME DEFAULT GETDATE()
);
GO

-- [차량 점검 기록]
CREATE TABLE TB_MANAGEMENT (
    MANAGEMENT_ID       NVARCHAR(50)    PRIMARY KEY,            -- PK (M000_yyyymmdd)
    LICENSE_PLATE       NVARCHAR(30),
    MANAGEMENT_DATE     DATE,
    MANAGEMENT_TYPE     NVARCHAR(50),                           -- 점검내용 (세차, 엔진오일 등)
    MANAGEMENT_DETAILS  NVARCHAR(MAX),                          -- 상세내용
    REPAIRSHOP          NVARCHAR(100),                          -- 수리업체
    
    MILEAGE             INT,                                    -- 점검 당시 주행거리
    NOTE                NVARCHAR(MAX),                          -- 비고
    MANAGER_NAME        NVARCHAR(50),                           -- 담당자 이름
    
    CREATED_AT          DATETIME        DEFAULT GETDATE()
);
GO

-- [이력 관리]
CREATE TABLE TB_HISTORY (
    RENTAL_HISTORY_ID   NVARCHAR(50)    PRIMARY KEY,            -- PK (H000_yyyymmdd)
    DISPATCH_ID         NVARCHAR(50),                           -- 원본 ID
    
    VEHICLE_NAME        NVARCHAR(50),
    MEMBER_ID           NVARCHAR(50),
    MEMBER_NAME         NVARCHAR(50),
    ACTION_TYPE         NVARCHAR(20),                           -- 신청, 수정, 반납, 취소
    NOWROLE             NVARCHAR(20),
    
    RENTAL_DATE         DATETIME,
    DUE_DATE            DATETIME,
    START_MILEAGE       INT,
    REGION              NVARCHAR(100),
    VISIT_PLACE         NVARCHAR(100),
    BUSINESS_TYPE       NVARCHAR(50),
    
    RETURN_DATE         DATETIME NULL,
    END_MILEAGE         INT NULL,
    BUSINESS_DISTANCE   INT NULL,
    
    CREATED_AT          DATETIME        DEFAULT GETDATE()
);
GO

-- [세션 관리]
CREATE TABLE [dbo].[TB_SESSIONS](
    [sid] [varchar](255) NOT NULL PRIMARY KEY,
    [session] [varchar](max) NOT NULL,
    [expires] [datetime] NOT NULL
);
GO