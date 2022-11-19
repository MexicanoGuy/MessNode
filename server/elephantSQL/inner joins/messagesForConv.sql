SELECT messageId, content, authorName, conversationNb 
FROM messages
INNER JOIN conversation
ON conversation.conversationid = message.conversationNo;