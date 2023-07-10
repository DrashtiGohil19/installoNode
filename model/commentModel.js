const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({

    commentUserId: { type: String },
    comment: { type: String },
    totalComment: { type: Number },
    commentThumbnail: { type: String },
    postId: { type: String },
    postUserId: { type: String }
})

const commentModel = mongoose.model('comment', commentSchema)

module.exports = commentModel