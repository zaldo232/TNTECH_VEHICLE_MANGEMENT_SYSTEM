/**
 * @file        Create_Procedure_Member.sql
 * @description 사용자(멤버) 정보의 조회, 등록, 수정, 삭제를 위한 프로시저 정의
 */

USE TNTECH_VEHICLE_MANGEMENT_SYSTEM
GO

/**
 * [전체 목록 조회]
 * 설명: 공통 코드 테이블과 조인하여 부서 및 직급의 한글 명칭을 포함한 전체 사원 리스트 반환
 */
CREATE OR ALTER PROCEDURE SP_GET_ALL_MEMBERS
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        A.MEMBER_ID,
        A.MEMBER_NAME,
        A.DEPARTMENT,
        ISNULL(B.CODE_NAME, A.DEPARTMENT) AS DEPT_NAME, -- 부서 한글명
        A.MEMBER_ROLE,
        ISNULL(C.CODE_NAME, A.MEMBER_ROLE) AS ROLE_NAME -- 직급 한글명
    FROM TB_MEMBERS A
    LEFT JOIN TB_COMMONCODE B ON A.DEPARTMENT = B.CONTENT_CODE AND B.GROUP_CODE = '부서'
    LEFT JOIN TB_COMMONCODE C ON A.MEMBER_ROLE = C.CONTENT_CODE AND C.GROUP_CODE = '직급'
    ORDER BY A.MEMBER_NAME ASC;
END
GO

/**
 * [특정 사원 상세 정보 조회]
 * @param @MEMBER_ID - 조회 대상 사번
 * 설명: 사번을 기준으로 해당 사원의 이름, 부서, 권한 정보 반환
 */
CREATE OR ALTER PROCEDURE SP_GET_MEMBER_DETAIL
    @MEMBER_ID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        MEMBER_ID,
        MEMBER_NAME,
        DEPARTMENT,
        MEMBER_ROLE
    FROM TB_MEMBERS
    WHERE MEMBER_ID = @MEMBER_ID;
END
GO

/**
 * [신규 사원 등록]
 * @param @MEMBER_ID       - 등록할 ID
 * @param @MEMBER_NAME     - 성명
 * @param @DEPARTMENT      - 부서 코드
 * @param @MEMBER_PASSWORD - 비밀번호
 * @param @MEMBER_ROLE     - 권한 코드
 * 설명: 아이디 중복 여부 검사 후 사원 정보 저장 및 결과 메시지 반환
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

    -- 아이디 중복 체크
    IF EXISTS (SELECT 1 FROM TB_MEMBERS WHERE MEMBER_ID = @MEMBER_ID)
    BEGIN
        SELECT 0 AS SUCCESS, '이미 사용 중인 아이디입니다.' AS MSG;
        RETURN;
    END

    -- 등록 실행
    INSERT INTO TB_MEMBERS (MEMBER_ID, MEMBER_NAME, DEPARTMENT, MEMBER_PASSWORD, MEMBER_ROLE)
    VALUES (@MEMBER_ID, @MEMBER_NAME, @DEPARTMENT, @MEMBER_PASSWORD, @MEMBER_ROLE);

    SELECT 1 AS SUCCESS, '멤버가 성공적으로 등록되었습니다.' AS MSG;
END
GO

-- 멤버 수정
/**
 * [정보 수정]
 * @param @MEMBER_ID   - 수정 대상 번호
 * @param @MEMBER_NAME - 수정할 성명
 * @param @DEPARTMENT  - 변경할 부서 코드
 * @param @MEMBER_ROLE - 변경할 직급 코드
 * 설명: 존재 여부 확인 후 이름, 부서, 권한 데이터 업데이트
 */
CREATE OR ALTER PROCEDURE SP_UPDATE_MEMBER
    @MEMBER_ID   NVARCHAR(50),
    @MEMBER_NAME NVARCHAR(50),
    @DEPARTMENT  NVARCHAR(50),
    @MEMBER_ROLE NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM TB_MEMBERS WHERE MEMBER_ID = @MEMBER_ID)
    BEGIN
        SELECT 0 AS SUCCESS, '해당 멤버를 찾을 수 없습니다.' AS MSG;
        RETURN;
    END

    UPDATE TB_MEMBERS
    SET MEMBER_NAME = @MEMBER_NAME,
        DEPARTMENT = @DEPARTMENT,
        MEMBER_ROLE = @MEMBER_ROLE
    WHERE MEMBER_ID = @MEMBER_ID;

    SELECT 1 AS SUCCESS, '정보가 수정되었습니다.' AS MSG;
END
GO

/**
 * [정보 삭제]
 * @param @MEMBER_ID - 삭제 대상 번호
 * 설명: 배차 기록 존재 여부 확인 후, 기록이 없는 경우에만 삭제 수행
 */
CREATE OR ALTER PROCEDURE SP_DELETE_MEMBER
    @MEMBER_ID NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    -- 배차 기록이 있는지 확인 (기록이 있으면 삭제 불가하게 막음)
    IF EXISTS (SELECT 1 FROM TB_DISPATCH WHERE MEMBER_ID = @MEMBER_ID)
    BEGIN
        SELECT 0 AS SUCCESS, '배차 기록이 있는 멤버는 삭제할 수 없습니다.' AS MSG;
        RETURN;
    END

    DELETE FROM TB_MEMBERS WHERE MEMBER_ID = @MEMBER_ID;

    SELECT 1 AS SUCCESS, '멤버가 삭제되었습니다.' AS MSG;
END
GO