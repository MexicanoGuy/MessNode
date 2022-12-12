CREATE TABLE blocked(
    blockedId SERIAL PRIMARY KEY,
    userNo VARCHAR(30) NOT NULL, 
    userBlockedNo VARCHAR(30) NOT NULL
);