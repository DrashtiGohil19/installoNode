const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({

    userId: { type: String },
    image: { type: String },
    thumbnail: { type: String },
    username: { type: String },
    like: { type: Array },
    totalLike: { type: Number },
    totalComment: { type: Number },
    lastLike: { type:String }
})

const postModel = mongoose.model('post', postSchema);

module.exports = postModel