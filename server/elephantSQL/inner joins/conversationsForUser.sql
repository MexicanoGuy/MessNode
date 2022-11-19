SELECT conversationtitle, creator 
FROM conversation 
INNER JOIN users
ON conversation.creator = users.username;