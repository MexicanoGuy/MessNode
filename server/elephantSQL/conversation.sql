CREATE TABLE conversation (
    conversationId SERIAL PRIMARY KEY,
    conversationTitle VARCHAR(50) NOT NULL,
    creator VARCHAR(30) NOT NULL,
    participants TEXT[]
);