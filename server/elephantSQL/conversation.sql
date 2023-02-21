CREATE TABLE conversation (
    conversationId SERIAL PRIMARY KEY,
    conversationTitle VARCHAR(50) NOT NULL,
    pic VARCHAR(255) DEFAULT 'conv_cga93k.jpg',
    creator INTEGER NOT NULL,
    participants INTEGER[],
    admins INTEGER[]
);