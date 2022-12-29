CREATE TABLE conversation (
    conversationId SERIAL PRIMARY KEY,
    conversationTitle VARCHAR(50) NOT NULL,
    creator INTEGER NOT NULL,
    participants INTEGER[],
    admins INTEGER[]
);