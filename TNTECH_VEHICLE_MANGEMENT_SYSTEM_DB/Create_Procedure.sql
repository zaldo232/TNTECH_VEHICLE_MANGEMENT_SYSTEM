/**
 * @file        Create_Procedure.sql
 * @description 사용자 인증(로그인/회원가입) 관련 저장 프로시저 정의
 */

USE TNTECH_VEHICLE_MANGEMENT_SYSTEM
GO

/**
 * [사용자 로그인 정보 조회]
 * @param @MEMBER_ID - 사용자 아이디
 * 설명: 회원 정보와 암호화된 비밀번호 반환
 */
CREATE OR ALTER PROCEDURE SP_LOGIN_MEMBER
    @MEMBER_ID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON; -- 불필요한 행 수 메시지 억제

    SELECT 
        MEMBER_ID, 
        MEMBER_NAME, 
        DEPARTMENT, 
        MEMBER_PASSWORD, -- bcrypt 검증용 해시값
        MEMBER_ROLE
    FROM TB_MEMBERS
    WHERE MEMBER_ID = @MEMBER_ID
END
GO

/**
 * [신규 등록]
 * @param @MEMBER_ID       - 아이디
 * @param @MEMBER_NAME     - 이름
 * @param @DEPARTMENT      - 부서명
 * @param @MEMBER_PASSWORD - 비밀번호
 * @param @MEMBER_ROLE     - 직급
 * 설명: 아이디 중복 확인 후 사원 정보 저장 및 결과 메시지 반환
 */
CREATE OR ALTER PROCEDURE SP_REGISTER_MEMBER
    @MEMBER_ID       NVARCHAR(50),
    @MEMBER_NAME     NVARCHAR(50),
    @DEPARTMENT      NVARCHAR(50),
    @MEMBER_PASSWORD NVARCHAR(MAX),
    @MEMBER_ROLE     NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- 기존 등록 여부 체크
    IF EXISTS (SELECT 1 FROM TB_MEMBERS WHERE MEMBER_ID = @MEMBER_ID)
    BEGIN
        SELECT 0 AS SUCCESS, '이미 존재하는 아이디입니다.' AS MSG;
        RETURN;
    END

    -- 신규 데이터 삽입
    INSERT INTO TB_MEMBERS (
        MEMBER_ID, 
        MEMBER_NAME, 
        DEPARTMENT, 
        MEMBER_PASSWORD, 
        MEMBER_ROLE
    )
    VALUES (
        @MEMBER_ID, 
        @MEMBER_NAME, 
        @DEPARTMENT, 
        @MEMBER_PASSWORD, 
        @MEMBER_ROLE
    );

    -- 성공 결과 반환
    SELECT 1 AS SUCCESS, '회원가입 성공' AS MSG;
END
GO