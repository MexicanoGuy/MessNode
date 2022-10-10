const mongoose = require('mongoose');

let ChatsSchema = new moongose.Schema({
    chatName: { String, required: true},
    userList: String
});

module.exports = mongoose.Schema('Chats', ChatsSchema);