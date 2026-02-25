/**
 * @file        Create_Procedure_Management.sql
 * @description 차량 점검 및 정비 기록의 등록과 조회를 위한 프로시저 정의
 */

USE TNTECH_VEHICLE_MANGEMENT_SYSTEM
GO

/**
 * [차량 점검 기록 등록]
 * @param @LICENSE_PLATE      - 차량 번호
 * @param @MANAGEMENT_DATE    - 점검 실시 일자
 * @param @MANAGEMENT_TYPE    - 점검 항목 구분 (세차, 소모품교환, 수리, 점검 등)
 * @param @MANAGEMENT_DETAILS - 상세 정비 및 점검 내역
 * @param @REPAIRSHOP         - 방문 정비소 명칭
 * @param @MILEAGE            - 점검 당시 누적 주행거리
 * @param @NOTE               - 비고 및 특이사항
 * @param @MANAGER_NAME       - 점검 확인자 성명
 * 설명: 점검 ID(M+일련번호) 채번 후 이력 저장 및 차량 마스터 주행거리 최신화
 */
CREATE OR ALTER PROCEDURE SP_REGISTER_MANAGEMENT
    @LICENSE_PLATE      NVARCHAR(30),
    @MANAGEMENT_DATE    DATE,
    @MANAGEMENT_TYPE    NVARCHAR(50), -- 세차, 소모품교환, 수리, 점검
    @MANAGEMENT_DETAILS NVARCHAR(MAX),
    @REPAIRSHOP         NVARCHAR(100),
    @MILEAGE            INT,
    @NOTE               NVARCHAR(MAX),
    @MANAGER_NAME       NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    DECLARE @TODAY NVARCHAR(8) = CONVERT(NVARCHAR(8), GETDATE(), 112);
    DECLARE @MANAGEMENT_ID NVARCHAR(50);
    DECLARE @SERIAL_NUM INT;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- ID 채번 (M000_YYYYMMDD)
        IF NOT EXISTS (SELECT 1 FROM TB_LAST_SERIAL WHERE BASE_DATE = 'M000_' + @TODAY AND SERIAL_TYPE = 'MANAGEMENT')
            INSERT INTO TB_LAST_SERIAL (BASE_DATE, SERIAL_TYPE, LAST_SERIAL) VALUES ('M000_' + @TODAY, 'MANAGEMENT', 0);
        
        UPDATE TB_LAST_SERIAL 
        SET @SERIAL_NUM = LAST_SERIAL = LAST_SERIAL + 1 
        WHERE BASE_DATE = 'M000_' + @TODAY AND SERIAL_TYPE = 'MANAGEMENT';
        
        SET @MANAGEMENT_ID = 'M' + RIGHT('000' + CAST(@SERIAL_NUM AS NVARCHAR), 3) + '_' + @TODAY;

        -- 데이터 저장
        INSERT INTO TB_MANAGEMENT (
            MANAGEMENT_ID, LICENSE_PLATE, MANAGEMENT_DATE, MANAGEMENT_TYPE, 
            MANAGEMENT_DETAILS, REPAIRSHOP, MILEAGE, NOTE, MANAGER_NAME
        ) VALUES (
            @MANAGEMENT_ID, @LICENSE_PLATE, @MANAGEMENT_DATE, @MANAGEMENT_TYPE, 
            @MANAGEMENT_DETAILS, @REPAIRSHOP, @MILEAGE, @NOTE, @MANAGER_NAME
        );

        -- 차량 마스터의 주행거리가 입력된 주행거리보다 작을 경우에만 업데이트
        UPDATE TB_VEHICLES 
        SET MILEAGE = @MILEAGE 
        WHERE LICENSE_PLATE = @LICENSE_PLATE AND MILEAGE < @MILEAGE;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

/**
 * [월별 점검 기록 목록 조회]
 * @param @MONTH - 조회 기준 월 (YYYY-MM)
 * 설명: 해당 월에 등록된 모든 차량의 정비 및 점검 내역을 최신순으로 반환
 */
CREATE OR ALTER PROCEDURE SP_GET_MANAGEMENT_LIST
    @MONTH NVARCHAR(7) -- 예: '2026-03'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        M.MANAGEMENT_ID,
        M.LICENSE_PLATE,
        V.VEHICLE_NAME,
        M.MANAGEMENT_DATE,
        M.MANAGEMENT_TYPE,
        M.MANAGEMENT_DETAILS,
        M.REPAIRSHOP,
        M.MILEAGE,
        M.MANAGER_NAME
    FROM TB_MANAGEMENT M
    LEFT JOIN TB_VEHICLES V ON M.LICENSE_PLATE = V.LICENSE_PLATE
    WHERE FORMAT(M.MANAGEMENT_DATE, 'yyyy-MM') = @MONTH
    ORDER BY M.MANAGEMENT_DATE DESC;
END
GO