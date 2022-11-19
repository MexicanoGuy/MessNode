CREATE TABLE messages(
    msgId SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    timestamp TIME,
    author VARCHAR(30) NOT NULL,
    convNo INTEGER NOT NULL
);
INSERT INTO message(content, timestamp, author, convNo) values($1,$2,$3,$4);