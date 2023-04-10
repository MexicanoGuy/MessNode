CREATE TABLE messages(
    msgId SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TIMESTAMP,
    authorNo INTEGER NOT NULL,
    convNo INTEGER NOT NULL
);
INSERT INTO message(content, timestamp, author, convNo) values($1,$2,$3,$4);