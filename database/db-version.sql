CREATE TABLE IF NOT EXISTS AVATARS
(
    AVATAR_ID   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    AVATAR_PATH VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS USERTYPES
(
    USRTYPE_ID   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    USRTYPE_DESC VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS SYSTEMUSERS 
(
    SU_ID           INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    SU_NICKNAME     VARCHAR(50),
    SU_LOGINNAME    VARCHAR(100),
    SU_PASSWORD     VARCHAR(500),
    SU_PHONENUMBER  VARCHAR(50),
    SU_DATEBIRTHDAY VARCHAR(50),
    SU_PHOTO        INT,
    SU_TYPE         INT
);

ALTER TABLE SYSTEMUSERS ADD CONSTRAINT fk_su_photo FOREIGN KEY (SU_PHOTO) REFERENCES AVATARS(AVATAR_ID);
ALTER TABLE SYSTEMUSERS ADD CONSTRAINT fk_su_type FOREIGN KEY (SU_TYPE) REFERENCES USERTYPES(USRTYPE_ID);

CREATE TABLE IF NOT EXISTS MANGAPHOTOS
(
    MGP_ID   INT NOT NULL PRIMARY KEY,
    MGP_PATH VARCHAR(20000)
);

CREATE TABLE IF NOT EXISTS MANGAS
(
    MG_ID         INT NOT NULL PRIMARY KEY,
    MG_TITLE      VARCHAR(100),
    MG_PHOTO      INT,
	MG_REGDATE    DATE
);

ALTER TABLE MANGAS ADD CONSTRAINT fk_mg_photo FOREIGN KEY (MG_PHOTO) REFERENCES MANGAPHOTOS(MGP_ID);

CREATE TABLE IF NOT EXISTS MANGACHAPTERS
(
    MGC_ID         INT NOT NULL PRIMARY KEY,
    MG_ID          INT,
    MGC_SEQCHAPTER INT,
    MGC_REGDATE    DATE
);

ALTER TABLE MANGACHAPTERS ADD CONSTRAINT fk_mg_id FOREIGN KEY (MG_ID) REFERENCES MANGAS(MG_ID);

CREATE TABLE IF NOT EXISTS MANGAPHOTOSFORCHAPTERS
(
    MGF_ID         INT NOT NULL PRIMARY KEY,
    MG_ID          INT,
    MGC_SEQCHAPTER INT,
    MGF_ARCHIVE    VARCHAR(20000)
);

ALTER TABLE MANGAPHOTOSFORCHAPTERS ADD CONSTRAINT fk_mg_id FOREIGN KEY (MG_ID) REFERENCES MANGAS(MG_ID);

/* PROCEDURES */

CREATE PROCEDURE `REGISTER_SYSTEMUSERS`(
	IN P_SU_NICKNAME     VARCHAR(50),
    IN P_SU_LOGINNAME    VARCHAR(100),
    IN P_SU_PASSWORD     VARCHAR(500),
    IN P_SU_PHONENUMBER  VARCHAR(50),
    IN P_SU_DATEBIRTHDAY VARCHAR(50),
    IN P_SU_PHOTO        INT,
    IN P_SU_TYPE         INT
)
BEGIN
	DECLARE V_SU_ID INT DEFAULT 0;
    
    SELECT COALESCE(MAX(SU_ID),  0) + 1
      INTO V_SU_ID
	  FROM SYSTEMUSERS;
      
	IF V_SU_ID <> 0 THEN
		INSERT INTO SYSTEMUSERS
		     VALUES 
             (
				V_SU_ID,
                P_SU_NICKNAME,
                P_SU_LOGINNAME,
                P_SU_PASSWORD,
                P_SU_PHONENUMBER,
                P_SU_DATEBIRTHDAY,
                P_SU_PHOTO,
                P_SU_TYPE
             );
    END IF;
END

CREATE PROCEDURE `REGISTER_MANGAS`(
	IN P_MG_TITLE VARCHAR(100),
    IN P_MG_PHOTO VARCHAR(20000)
)
BEGIN
    DECLARE V_MGP_ID INT DEFAULT 0;
	DECLARE V_MG_ID  INT DEFAULT 0;

    SELECT COALESCE(MAX(MGP_ID), 0) + 1
      INTO V_MGP_ID
      FROM MANGAPHOTOS;

    IF V_MGP_ID <> 0 THEN
        INSERT INTO MANGAPHOTOS
            VALUES
            (
                V_MGP_ID,
                P_MG_PHOTO
            );
    END IF;
    
    SELECT COALESCE(MAX(MG_ID),  0) + 1
      INTO V_MG_ID
	  FROM MANGAS;
      
	IF V_MG_ID <> 0 THEN
		INSERT INTO MANGAS
		     VALUES 
             (
				V_MG_ID,
                P_MG_TITLE,
                V_MGP_ID,
                CURRENT_DATE()
             );
    END IF;
END

CREATE PROCEDURE `REGISTER_CHAPTERS`(
    IN P_MG_ID INT,
    IN P_MGF_ARCHIVE VARCHAR(20000),
    IN P_MGC_SEQCHAPTER INT
)
BEGIN
	DECLARE V_MGC_ID INT DEFAULT 0;
    DECLARE V_MGF_ID INT DEFAULT 0;
    
    SELECT COALESCE(MAX(MGC_ID),  0) + 1
      INTO V_MGC_ID
	  FROM MANGACHAPTERS;

    SELECT COALESCE(MAX(MGF_ID),  0) + 1
      INTO V_MGF_ID
	  FROM MANGAPHOTOSFORCHAPTERS;
      
	IF V_MGC_ID <> 0 THEN
		INSERT INTO MANGACHAPTERS
		     VALUES 
             (
				V_MGC_ID,
                P_MG_ID,
                V_SEQ,
                CURRENT_DATE()
             );
    END IF;

    IF V_MGF_ID <> 0 THEN
        INSERT INTO MANGAPHOTOSFORCHAPTERS
            VALUES 
            (
                V_MGF_ID,
                P_MG_ID,
                P_MGC_SEQCHAPTER,
                P_MGF_ARCHIVE
            );
    END IF;
END

CREATE PROCEDURE `EDIT_SYSTEMUSERS` (
    IN P_SU_NICKNAME     VARCHAR(50),
    IN P_SU_LOGINNAME    VARCHAR(100),
    IN P_SU_PHONENUMBER  VARCHAR(50),
    IN P_SU_DATEBIRTHDAY VARCHAR(50),
    IN P_SU_PHOTO        INT,
    IN P_SU_ID           INT
)
BEGIN
    UPDATE SYSTEMUSERS 
       SET SU_NICKNAME = COALESCE(P_SU_NICKNAME, SU_NICKNAME),
           SU_LOGINNAME = COALESCE(P_SU_LOGINNAME, SU_LOGINNAME),
           SU_PHONENUMBER = COALESCE(P_SU_PHONENUMBER, SU_PHONENUMBER),
           SU_DATEBIRTHDAY = COALESCE(P_SU_DATEBIRTHDAY, SU_DATEBIRTHDAY),
           SU_PHOTO = COALESCE(P_SU_PHOTO, SU_PHOTO)
     WHERE SU_ID = P_SU_ID;
END