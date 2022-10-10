const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProfileSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    nickname:{
        type: String,
        required: true
    },
    pwd:{
        type: String,
        required: true
    },
    activityStatus:{
        type: String,
        default: true
    }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);