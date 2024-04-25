const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogPost = Schema({
    username: String,
    title: String,
    dp: String,
    body: String,
    coverImage: {
        type: String,
        default: "",
    },
    like: {
        type: Number,
        default: 0
    },
    comment: {
        type: Number,
        default: 0
    },
    share: {
        type: Number,
        default: 0
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
})


module.exports = mongoose.model('BlogPost', BlogPost);
