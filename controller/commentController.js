const commentModel = require('../model/commentModel')
const storage = require('node-persist');
const loginModel = require('../model/loginModel');
const postModel = require('../model/postModel');

// ---- post comment to the post ----

exports.comment = async (req, res) => {
    var id = req.params.id;
    var comment = req.body.comment;
    await storage.init();   
    var uid = await storage.getItem('userid');
    var postUser = await postModel.findOne({ _id: id })
    var commentUser = await loginModel.findOne({ _id: uid })

    var obj = {
        "postId": id,
        "postUserId": postUser.userId,
        "commentUserId": uid,
        "commentThumbnail": commentUser.profile_pic,
        "comment": comment,
    }
    if (comment !== "") {
        await commentModel.create(obj);
    }

    // ---- count total comments and store in postModel ----
    postUser.totalComment = (postUser.totalComment || 0) + 1;
    await postUser.save();
    
    res.redirect('/feed');
}

