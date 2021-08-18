CREATE TABLE IF NOT EXISTS AVATARS
(
    AVATAR_ID   INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    AVATAR_PATH VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS SYSTEMUSERS 
(
    SU_ID           INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    SU_NICKNAME     VARCHAR(50),
    SU_LOGINNAME    VARCHAR(100),
    SU_PASSWORD     VARCHAR(500),
    SU_PHONENUMBER  VARCHAR(50),
    SU_DATEBIRTHDAY VARCHAR(50),
    SU_PHOTO        INT
);

ALTER TABLE SYSTEMUSERS ADD CONSTRAINT fk_su_photo FOREIGN KEY (SU_PHOTO) REFERENCES AVATARS(AVATAR_ID);


/* PROCEDURES */

CREATE ROCEDURE `REGISTER_SYSTEMUSERS`(
	IN P_SU_NICKNAME     VARCHAR(50),
    IN P_SU_LOGINNAME    VARCHAR(100),
    IN P_SU_PASSWORD     VARCHAR(500),
    IN P_SU_PHONENUMBER  VARCHAR(50),
    IN P_SU_DATEBIRTHDAY VARCHAR(50),
    IN P_SU_PHOTO        INT
)
BEGIN
	DECLARE V_SU_ID INT DEFAULT 0;
    
    SELECT COALESCE(SU_ID,  0) + 1
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
                P_SU_PHOTO
             );
    END IF;
END