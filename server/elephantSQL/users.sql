CREATE TABLE users(
    userId SERIAL PRIMARY KEY,
    email VARCHAR(30) NOT NULL, 
    username VARCHAR(30) NOT NULL,
    pwd VARCHAR NOT NULL,
    pfp VARCHAR NOT NULL,
    activity VARCHAR NOT NULL DEFAULT 'Offline'
);
INSERT INTO users(email, username, pwd) values($1,$2,$3);
INSERT INTO users(email, username, pwd) values('test','test','test123!');