/**
 * @file        Create_Procedure_Vehicle.sql
 * @description 차량 마스터 정보 관리, 가용 차량 조회 및 정기 점검 알림
 */

USE TNTECH_VEHICLE_MANGEMENT_SYSTEM
GO

/**
 * [전체 차량 및 점검 알림 조회]
 * 설명: 차량 상태 명칭 치환 및 설정된 점검 주기 대비 현재 주행거리를 비교하여 주의/경고 알림 생성
 */
CREATE OR ALTER PROCEDURE SP_GET_ALL_VEHICLES
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        V.LICENSE_PLATE,
        V.VEHICLE_NAME,
        V.MILEAGE, 
        V.VEHICLES_STATUS,
        ISNULL(C.CODE_NAME, V.VEHICLES_STATUS) AS STATUS_NAME,
        V.IS_MANAGED,
        ISNULL(STRING_AGG(Alerts.Msg, ', '), '') AS MAINTENANCE_ALERTS,
        ISNULL(MAX(Alerts.Danger), 0) AS DANGER_LEVEL
    FROM TB_VEHICLES V
    LEFT JOIN TB_COMMONCODE C ON V.VEHICLES_STATUS = C.CONTENT_CODE AND C.GROUP_CODE = '차량상태'
    LEFT JOIN (
        SELECT 
            S.LICENSE_PLATE,
            S.INTERVAL_KM,
            CC.CODE_NAME,
            ISNULL(L.MILEAGE, 0) as LastM,
            S.MANAGEMENT_TYPE
        FROM TB_MANAGEMENT_SETTINGS S
        JOIN TB_COMMONCODE CC ON S.MANAGEMENT_TYPE = CC.CONTENT_CODE AND CC.GROUP_CODE = '점검내용'
        OUTER APPLY (
            SELECT TOP 1 MILEAGE 
            FROM TB_MANAGEMENT 
            WHERE LICENSE_PLATE = S.LICENSE_PLATE AND MANAGEMENT_TYPE = S.MANAGEMENT_TYPE
            ORDER BY MANAGEMENT_DATE DESC, CREATED_AT DESC
        ) L
    ) AS MgtBase ON V.LICENSE_PLATE = MgtBase.LICENSE_PLATE
    OUTER APPLY (
        SELECT 
            CASE 
                -- 사용자가 0km로 설정한 경우 무조건 경고 안 띄움(0)
                WHEN ISNULL(MgtBase.INTERVAL_KM, 0) <= 0 THEN 0
                WHEN (V.MILEAGE - MgtBase.LastM) >= MgtBase.INTERVAL_KM THEN 2
                WHEN (V.MILEAGE - MgtBase.LastM) >= MgtBase.INTERVAL_KM * 0.9 THEN 1
                ELSE 0 
            END AS Danger,
            CASE 
                -- 사용자가 0km로 설정한 경우 문구도 아예 생략 (NULL)
                WHEN ISNULL(MgtBase.INTERVAL_KM, 0) <= 0 THEN NULL
                WHEN (V.MILEAGE - MgtBase.LastM) >= MgtBase.INTERVAL_KM THEN '(' + MgtBase.CODE_NAME + '경고)'
                WHEN (V.MILEAGE - MgtBase.LastM) >= MgtBase.INTERVAL_KM * 0.9 THEN '(' + MgtBase.CODE_NAME + '주의)'
                ELSE NULL 
            END AS Msg
    ) Alerts
    GROUP BY 
        V.LICENSE_PLATE, 
        V.VEHICLE_NAME, 
        V.MILEAGE, 
        V.VEHICLES_STATUS, 
        C.CODE_NAME, 
        V.IS_MANAGED
    ORDER BY V.LICENSE_PLATE ASC;
END
GO

/**
 * [차량 정보 저장 및 수정]
 * @param @LICENSE_PLATE   - 차량 번호 (PK)
 * @param @VEHICLE_NAME    - 차종 명칭
 * @param @MILEAGE         - 현재 주행거리
 * @param @VEHICLES_STATUS - 차량 상태 코드
 * @param @IS_MANAGED      - 점검 관리 대상 여부
 * 설명: 차량 번호 존재 시 정보 업데이트, 미존재 시 신규 데이터 삽입
 */
CREATE OR ALTER PROCEDURE SP_SAVE_VEHICLE
    @LICENSE_PLATE   NVARCHAR(30),
    @VEHICLE_NAME    NVARCHAR(50),
    @MILEAGE         INT,
    @VEHICLES_STATUS NVARCHAR(20),
    @IS_MANAGED      CHAR(1) = 'Y'
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM TB_VEHICLES WHERE LICENSE_PLATE = @LICENSE_PLATE)
    BEGIN
        UPDATE TB_VEHICLES 
        SET VEHICLE_NAME = @VEHICLE_NAME, 
            MILEAGE = @MILEAGE, 
            VEHICLES_STATUS = @VEHICLES_STATUS,
            IS_MANAGED = @IS_MANAGED
        WHERE LICENSE_PLATE = @LICENSE_PLATE;
    END
    ELSE
    BEGIN
        INSERT INTO TB_VEHICLES (LICENSE_PLATE, VEHICLE_NAME, MILEAGE, VEHICLES_STATUS, IS_MANAGED)
        VALUES (@LICENSE_PLATE, @VEHICLE_NAME, @MILEAGE, @VEHICLES_STATUS, @IS_MANAGED);
    END
    SELECT 1 AS SUCCESS, '차량 정보가 저장되었습니다.' AS MSG;
END
GO

/**
 * [차량 데이터 삭제]
 * @param @LICENSE_PLATE - 삭제할 차량 번호
 */
CREATE OR ALTER PROCEDURE SP_DELETE_VEHICLE
    @LICENSE_PLATE NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM TB_VEHICLES WHERE LICENSE_PLATE = @LICENSE_PLATE;
    SELECT 1 AS SUCCESS, '차량이 삭제되었습니다.' AS MSG;
END
GO

/**
 * [배차 가용 차량 필터링 조회]
 * @param @TARGET_DATE   - 대여 희망 날짜
 * @param @TARGET_PERIOD - 대여 희망 시간대 (AM/PM/ALL)
 * 설명: 상태가 'AVAILABLE'이며 해당 시간대에 중복 예약이 없는 차량 목록 반환
 */
CREATE OR ALTER PROCEDURE SP_GET_AVAILABLE_VEHICLES
    @TARGET_DATE    DATE,           -- 사용자가 선택한 날짜
    @TARGET_PERIOD  NVARCHAR(20)    -- 사용자가 선택한 교시 (AM, PM, ALL)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        V.LICENSE_PLATE, 
        V.VEHICLE_NAME,
        V.MILEAGE
    FROM TB_VEHICLES V
    WHERE V.VEHICLES_STATUS = 'AVAILABLE'
      AND V.LICENSE_PLATE NOT IN (
          SELECT LICENSE_PLATE 
          FROM TB_DISPATCH 
          WHERE CONVERT(DATE, RENTAL_DATE) = @TARGET_DATE 
            AND DISPATCH_STATUS = 'RESERVED'
            AND (
                RENTAL_PERIOD = 'ALL'
                OR @TARGET_PERIOD = 'ALL'
                OR RENTAL_PERIOD = @TARGET_PERIOD
            )
      )
    ORDER BY V.VEHICLE_NAME ASC;
END
GO

/**
 * [차량별 점검 주기 설정 로드]
 * @param @LICENSE_PLATE - 대상 차량 번호
 * 설명: 공통 코드 '점검내용'을 기준으로 각 차량에 설정된 정비 주기(km)를 조회
 */
CREATE OR ALTER PROCEDURE SP_GET_MANAGEMENT_SETTINGS
    @LICENSE_PLATE NVARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        A.CONTENT_CODE AS MANAGEMENT_TYPE,
        A.CODE_NAME,
        ISNULL(B.INTERVAL_KM, 0) AS INTERVAL_KM
    FROM TB_COMMONCODE A
    LEFT JOIN TB_MANAGEMENT_SETTINGS B 
        ON A.CONTENT_CODE = B.MANAGEMENT_TYPE AND B.LICENSE_PLATE = @LICENSE_PLATE
    WHERE A.GROUP_CODE = '점검내용'
    ORDER BY A.SORT_ORDER ASC;
END
GO

/**
 * [차량별 항목 점검 주기 저장]
 * @param @LICENSE_PLATE   - 차량 번호
 * @param @MANAGEMENT_TYPE - 점검 항목 코드
 * @param @INTERVAL_KM     - 설정 주기(km)
 * 설명: 특정 차량의 정비 항목별 주기 값을 Upsert 방식으로 저장
 */
CREATE OR ALTER PROCEDURE SP_SAVE_MANAGEMENT_SETTING
    @LICENSE_PLATE      NVARCHAR(30),
    @MANAGEMENT_TYPE    NVARCHAR(40),
    @INTERVAL_KM        INT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT 1 FROM TB_MANAGEMENT_SETTINGS WHERE LICENSE_PLATE = @LICENSE_PLATE AND MANAGEMENT_TYPE = @MANAGEMENT_TYPE)
    BEGIN
        UPDATE TB_MANAGEMENT_SETTINGS SET INTERVAL_KM = @INTERVAL_KM 
        WHERE LICENSE_PLATE = @LICENSE_PLATE AND MANAGEMENT_TYPE = @MANAGEMENT_TYPE;
    END
    ELSE
    BEGIN
        INSERT INTO TB_MANAGEMENT_SETTINGS (LICENSE_PLATE, MANAGEMENT_TYPE, INTERVAL_KM)
        VALUES (@LICENSE_PLATE, @MANAGEMENT_TYPE, @INTERVAL_KM);
    END
END
GO