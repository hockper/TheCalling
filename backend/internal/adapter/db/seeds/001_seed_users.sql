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

-- Additional Handlers
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'Charlie Handler',
    'charlie.handler@thecalling.com',
    '$2b$10$V2Ypkp.GtqYWDpJO4benPe6LCEvi/06dgP1lZmOdLKaLC24MWy3dK',
    'handler'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    'd4e5f6a7-b8c9-0123-def0-123456789013',
    'Dave Handler',
    'dave.handler@thecalling.com',
    '$2b$10$V2Ypkp.GtqYWDpJO4benPe6LCEvi/06dgP1lZmOdLKaLC24MWy3dK',
    'handler'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Additional Requesters
INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    'e5f6a7b8-c9d0-1234-ef01-123456789014',
    'Eve Requester',
    'eve.requester@thecalling.com',
    '$2b$10$V2Ypkp.GtqYWDpJO4benPe6LCEvi/06dgP1lZmOdLKaLC24MWy3dK',
    'requester'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    'f6a7b8c9-d0e1-2345-f012-123456789015',
    'Frank Requester',
    'frank.requester@thecalling.com',
    '$2b$10$V2Ypkp.GtqYWDpJO4benPe6LCEvi/06dgP1lZmOdLKaLC24MWy3dK',
    'requester'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    '01234567-89ab-cdef-0123-456789abcdef',
    'Grace Requester',
    'grace.requester@thecalling.com',
    '$2b$10$V2Ypkp.GtqYWDpJO4benPe6LCEvi/06dgP1lZmOdLKaLC24MWy3dK',
    'requester'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO users (id, name, email, password_hash, role)
VALUES (
    '12345678-9abc-def0-1234-56789abcdef0',
    'Heidi Requester',
    'heidi.requester@thecalling.com',
    '$2b$10$V2Ypkp.GtqYWDpJO4benPe6LCEvi/06dgP1lZmOdLKaLC24MWy3dK',
    'requester'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;
