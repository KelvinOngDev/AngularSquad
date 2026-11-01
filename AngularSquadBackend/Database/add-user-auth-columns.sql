ALTER TABLE table_user
    ADD COLUMN username VARCHAR(100) NULL,
    ADD COLUMN password_hash VARCHAR(255) NULL,
    ADD UNIQUE KEY uq_table_user_username (username);
