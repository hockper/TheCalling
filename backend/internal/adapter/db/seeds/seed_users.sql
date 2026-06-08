-- seed_users.sql
-- Inserts mock users for development and testing.
-- Password for both users: password123

INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Alice Handler',
    'handler@thecalling.com',
    '$2b$10$V2Ypkp.GtqYWDpJO4benPe6LCEvi/06dgP1lZmOdLKaLC24MWy3dK',
    'handler'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Bob Requester',
    'requester@thecalling.com',
    '$2b$10$V2Ypkp.GtqYWDpJO4benPe6LCEvi/06dgP1lZmOdLKaLC24MWy3dK',
    'requester'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;
