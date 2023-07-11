const loginModel = require('../model/loginModel')
var storage = require('node-persist')
var jwt = require('jsonwebtoken')
const postModel = require('../model/postModel')
const commentModel = require('../model/commentModel')
const chatModel = require('../model/chatModel')

exports.formLogin = async (req, res) => {

    await storage.init()
    var uid = await storage.getItem('userid');
    if (!uid) {
        res.render('form-login')
    } else {
        res.redirect('feed')
    }
    // res.render('form-login')
}   

exports.formregister = async (req, res) => {

    await storage.init()
    var uid = await storage.getItem('userid');
    if (!uid) {
        res.render('form-register')
    } else {
        res.redirect('feed')
    }
}

// ---- registration ----

exports.register = async (req, res) => {
    try {
        var firstname = req.body.firstname;
        var email = req.body.email;
        var password = req.body.password;
        var password1 = req.body.password1;

        if (!firstname || !email || !password || !password1) {
            res.status(400).json({
                status: "All fields are required.",
            });
        } else {
            var existingUser = await loginModel.findOne({ firstname, email });
            if (existingUser) {
                res.status(400).json({
                    status: "User already registered. Please login or enter another username or email.",
                });
            } else {
                if (password == password1) {
                    var data = await loginModel.create(req.body);
                    if (data != null) {

                        res.redirect('/');
                    }
                } else {
                    res.status(500).json({
                        status: "Please check your password",
                    });
                }
            }
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed to register",
            error,
        });
    }
};

// ---- login ----

exports.login = async (req, res) => {
    try {
        var email = req.body.email;
        var password = req.body.password;

        var data = await loginModel.find({ "email": email });
        if (data !== null) {
            if (data[0].password === password) {

                var token = jwt.sign({ id: data[0].id }, "instelloAPI")

                await storage.init();
                await storage.setItem('userid', data[0].id)
                await loginModel.findByIdAndUpdate(data[0].id, { "token": token })
                await storage.setItem('usertoken', data[0].token);

                var tokenG = await storage.getItem('usertoken')

                if (data[0].token === tokenG) {
                    res.redirect('/feed')
                } else {
                    res.status(400).json({
                        status: "token not match",
                    })
                }

            } else {
                res.status(500).json({
                    status: "Please check your password",
                })
            }
        } else {
            res.status(500).json({
                status: "Please check your email",
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed to login",
            error
        });
    }
};

// ---- logout ----

exports.logout = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    var obj = {
        "token": "",
        "__v": 0
    }
    await loginModel.findByIdAndUpdate(uid, obj);
    await storage.removeItem('userid');
    res.redirect('/')
}

// ---- feed page ----

exports.feed = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    if (uid) {
        var data = await loginModel.findOne({ _id: uid })

        // ---- user is online ----
        await loginModel.findByIdAndUpdate(uid, { __v: 1 })

        // ---- get followed users ----
        const currentUser = await loginModel.findById(uid);
        const followedUsers = currentUser.following;

        // ---- find last 4 new user ----
        var newRegister = await loginModel.find({ _id: { $ne: uid } }).sort({ _id: -1 }).limit(4);

        // ---- find last 4 letest post ----
        var newpost = await postModel.find({ $or: [{ userId: uid }, { userId: { $in: followedUsers } }] }).sort({ _id: -1 }).limit(4);

        // ---- total post ----
        var total_post = await postModel.count({ userId: uid });

        // ---- get only followed user's post ----
        var post = await postModel.find({ $or: [{ userId: uid }, { userId: { $in: followedUsers } }] }).sort({ _id: -1 });

        // ---- count following / followers ----
        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        // ---- follow status ----
        const followstatus = await loginModel.findById(uid);

        // ---- last 2 comments ----
        var postComments = {};
        for (const postItem of post) {
            const comments = await commentModel.find({ postId: postItem._id }).sort({ _id: -1 }).limit(2);
            postComments[postItem._id] = comments;
        }

        var likesData = {};
        for (const postItem of post) {
            const likeUsers = await loginModel.find({ _id: { $in: postItem.like } }).sort({ _id: -1 }).limit(3);
            likesData[postItem._id] = likeUsers;
        }

        res.render('feed', { data: data, post: post, newRegister: newRegister, newpost: newpost, total_post: total_post, followingCount: followingCount, followerCount: followerCount, followstatus: followstatus, postComments: postComments, likesData: likesData });
    } else {
        res.redirect('/')
    }
};

// ---- explore page ----

exports.explore = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    if (uid) {
        var data = await loginModel.findOne({ _id: uid })
        var post_img = await postModel.find({ "userId": uid });
        var total_post = await postModel.count({ userId: uid });
        const currentUser = await loginModel.findById(uid);
        const followedUsers = currentUser.following;
        var all_post = await postModel.find({ $or: [{ userId: uid }, { userId: { $in: followedUsers } }] }).sort({ _id: -1 });

        // ---- count following / followers ----
        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        // ---- last 2 comments ----
        var postComments = {};
        for (const postItem of all_post) {
            const comments = await commentModel.find({ postId: postItem._id }).sort({ _id: -1 }).limit(2);
            postComments[postItem._id] = comments;
        }
        var likesData = {};
        for (const postItem of all_post) {
            const likeUsers = await loginModel.find({ _id: { $in: postItem.like } }).sort({ _id: -1 }).limit(3);
            likesData[postItem._id] = likeUsers;
        }
        res.render('explore', { data: data, total_post: total_post, post_img: post_img, all_post: all_post, followingCount: followingCount, followerCount: followerCount, postComments: postComments, likesData:likesData });
    }
};

// ---- chat page ----

exports.chat = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    if (uid) {
        var chat_id = req.query.chat_id;

        if (chat_id) {
            await storage.init();
            var uid = await storage.getItem('userid');
            var r_data = await loginModel.find({ _id: chat_id })
            var chatData = await chatModel.find({ $or: [{ sender_id: uid, receiver_id: chat_id, }, { sender_id: chat_id, receiver_id: uid }] })

            // var chatData = await chatModel.find({
            //     $or: [
            //         { sender_id: uid, receiver_id: chat_id, sender_deleted: false },
            //         { sender_id: chat_id, receiver_id: uid, receiver_deleted: false }
            //     ]
            // });

        }

        await storage.init();
        var uid = await storage.getItem('userid');
        var data = await loginModel.findOne({ _id: uid })
        var post_img = await postModel.find({ "userId": uid });
        var total_post = await postModel.countDocuments({ userId: uid });
        const currentUser = await loginModel.findById(uid);
        const followedUsers = currentUser.following;
        var all_post = await loginModel.find({ _id: { $in: followedUsers, $ne: uid } }).sort({ _id: -1 });

        // ---- count following / followers ----
        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        res.render('chat', { data: data, total_post: total_post, post_img: post_img, all_post: all_post, followingCount: followingCount, followerCount: followerCount, r_data: r_data, chatData: chatData });
    }
};

// ---- trending page ----

exports.trending = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    if (uid) {
        var data = await loginModel.findOne({ _id: uid })
        var post_img = await postModel.find({ "userId": uid });
        var total_post = await postModel.countDocuments({ userId: uid });
        var newRegister = await loginModel.find({ _id: { $ne: uid } }).sort({ _id: -1 });

        // ---- get followed users ----
        const currentUser = await loginModel.findById(uid);
        const followedUsers = currentUser.following;

        // ---- count following / followers ----
        const user = await loginModel.findById(uid);
        var all_post = await postModel.find({ $or: [{ userId: uid }, { userId: { $in: followedUsers } }] }).sort({ _id: -1 });
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        // ---- last 2 comments ----
        var postComments = {};
        for (const postItem of all_post) {
            const comments = await commentModel.find({ postId: postItem._id }).sort({ _id: -1 }).limit(2);
            postComments[postItem._id] = comments;
        }
        var likesData = {};
        for (const postItem of all_post) {
            const likeUsers = await loginModel.find({ _id: { $in: postItem.like } }).sort({ _id: -1 }).limit(3);
            likesData[postItem._id] = likeUsers;
        }
        res.render('trending', { data: data, total_post: total_post, post_img: post_img, all_post: all_post, newRegister: newRegister, followingCount: followingCount, followerCount: followerCount, postComments: postComments, likesData:likesData });
    }
};

// ---- setting page ----

exports.setting = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    if (uid) {
        var data = await loginModel.findOne({ _id: uid })
        var total_post = await postModel.countDocuments({ userId: uid });

        // ---- count following / followers ----
        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;
        res.render('setting', { data: data, total_post: total_post, followingCount: followingCount, followerCount: followerCount });
    }
};

// ---- profile page ----

exports.profile = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    if (uid) {
        var data = await loginModel.findOne({ _id: uid })
        var post_img = await postModel.find({ userId: uid });
        var total_post = await postModel.count({ userId: uid });

        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        // ---- last 2 comments ----
        var postComments = {};
        for (const postItem of post_img) {
            const comments = await commentModel.find({ postId: postItem._id }).sort({ _id: -1 }).limit(2);
            postComments[postItem._id] = comments;
        }

        res.render('profile', { data: data, total_post: total_post, post_img: post_img, followingCount: followingCount, followerCount: followerCount, postComments: postComments });
    }
};

exports.profile_picPost = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    var file = req.file.filename;
    await loginModel.findByIdAndUpdate(uid, { profile_pic: file })
    await postModel.updateMany({ userId: uid }, { thumbnail: file })
    await chatModel.updateMany({ sender_id: uid }, { $set: { sender_profile: file } });
    await commentModel.updateMany({ commentUserId: uid }, { $set: { commentThumbnail: file } }); res.redirect('/profile');
};

// ---- delete post ----

exports.deletePost = async (req, res) => {
    var id = req.params.id;
    await postModel.findByIdAndDelete(id);
    res.redirect('/profile');
}

// ---- add friend ----

exports.friend = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    if (uid) {
        var id = req.params.id;
        var data = await loginModel.findOne({ _id: uid })
        var total_post = await postModel.count({ userId: uid });
        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        var currentUser = await loginModel.findById(id);
        var followingList = currentUser.following;

        const followstatus = await loginModel.findById(id);

        var usersNotFollowing = await loginModel.find({ _id: { $nin: followingList, $ne: id } });

        res.render('friend', { data: data, total_post: total_post, followingCount: followingCount, followerCount: followerCount, usersNotFollowing: usersNotFollowing, followstatus: followstatus })
    }
}

// ---- count followers ----

exports.follow = async (req, res) => {
    const id = req.params.id;
    var uid = await storage.getItem('userid');
    const followstatus = await loginModel.findById(uid);

    if (followstatus.following.includes(id)) {
        // ---- if following than unfollow ---
        await loginModel.findByIdAndUpdate(uid, { $pull: { following: id } })
        await loginModel.findByIdAndUpdate(id, { $pull: { follower: uid } })

    } else {
        // ---- if not following than follow ----
        await loginModel.findByIdAndUpdate(uid, { $push: { following: id } })
        await loginModel.findByIdAndUpdate(id, { $push: { follower: uid } })
    }
    res.redirect('/feed')
}

// ---- count like ----

exports.like = async (req, res) => {
    var id = req.params.id;
    var uid = await storage.getItem('userid');
    var likeUser = await loginModel.findById(uid);

    //---- Check if the user has liked post ---
    var post = await postModel.findById(id);
    if (post.like.includes(uid)) {
        // ---- if already liked post than unlike ----
        await postModel.findByIdAndUpdate(id, { $pull: { like: uid },$unset: { lastLike: 1 } });

    } else {
        // ---- if not liked post than like ----
        await postModel.findByIdAndUpdate(id, { $push: { like: uid }, $set: { lastLike:likeUser.firstname+" "+likeUser.lastname } });
    }
    // ---- count total like ----
    var updatedPost = await postModel.findById(id);
    updatedPost.totalLike = updatedPost.like.length;

    if (updatedPost.totalLike > 0) {
        // ---- Get the username of the last user who liked the post ----
        var lastUserId = updatedPost.like[updatedPost.totalLike - 1];
        var lastLikeUser = await loginModel.findById(lastUserId);
        updatedPost.lastLike = lastLikeUser.firstname + " " + lastLikeUser.lastname;
    } 

    await updatedPost.save();

    res.redirect('/feed')
}

// ---- search ----

exports.search = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');
    var data = await loginModel.findOne({ _id: uid })
    var total_post = await postModel.countDocuments({ userId: uid });

    // ---- count following / followers ----
    const user = await loginModel.findById(uid);
    const followingCount = user.following.length;
    const followerCount = user.follower.length;

    const followstatus = await loginModel.findById(uid);

    const searchUser = req.body.search;
    if (searchUser) {
        const regex = new RegExp(searchUser, 'i');
        var searchData = await loginModel.find({ firstname: regex });
    }

    res.render('search', { data: data, total_post: total_post, followingCount: followingCount, followerCount: followerCount, followstatus: followstatus, searchData: searchData });
}

// ---- retrive followers ----

exports.userfollowers = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');

    if (uid) {
        var data = await loginModel.findOne({ _id: uid })
        var post_img = await postModel.find({ "userId": uid });
        var total_post = await postModel.count({ userId: uid });

        var id = req.params.id;
        const user = await loginModel.findById(id);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        const userFollowers = await loginModel.find({ _id: { $in: user.follower } });

        const followstatus = await loginModel.findById(id);

        res.render('followers', { data: data, total_post: total_post, post_img: post_img, followingCount: followingCount, followerCount: followerCount, followstatus: followstatus, userFollowers: userFollowers });
    }
}

// ---- retrive following ----

exports.userfollowing = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');

    if (uid) {
        var data = await loginModel.findOne({ _id: uid })
        var post_img = await postModel.find({ "userId": uid });
        var total_post = await postModel.count({ userId: uid });

        var id = req.params.id;
        const user = await loginModel.findById(id);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        const userFollowing = await loginModel.find({ _id: { $in: user.following } });

        const followstatus = await loginModel.findById(id);

        res.render('following', { data: data, total_post: total_post, post_img: post_img, followingCount: followingCount, followerCount: followerCount, followstatus: followstatus, userFollowing: userFollowing });
    }
}

// ---- user profile page ----

exports.userProfile = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');

    if (uid) {
        var id = req.params.id;
        var data = await loginModel.findOne({ _id: uid })
        var total_post = await postModel.count({ userId: uid });
        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        var data1 = await loginModel.findOne({ _id: id })
        var total_post1 = await postModel.count({ userId: id });
        var user1 = await loginModel.findById(id);
        const followingCount1 = user1.following.length;
        const followerCount1 = user1.follower.length;
        var post_img1 = await postModel.find({ userId: id });

        var postComments = {};
        for (const postItem of post_img1) {
            const comments = await commentModel.find({ postId: postItem._id }).sort({ _id: -1 }).limit(2);
            postComments[postItem._id] = comments;
        }

        var likesData = {};
        for (const postItem of post_img1) {
            const likeUsers = await loginModel.find({ _id: { $in: postItem.like } }).sort({ _id: -1 }).limit(3);
            likesData[postItem._id] = likeUsers;
        }

        var isFollowing = user.following.includes(id);

        res.render('userprofile', { data: data, total_post: total_post, data1: data1, total_post1: total_post1, user: user, followingCount: followingCount, followerCount: followerCount, followingCount1: followingCount1, followerCount1: followerCount1, post_img1: post_img1, postComments: postComments, isFollowing: isFollowing, likesData:likesData })
    }
}

// ---- all like user ----

exports.postlike = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');

    if (uid) {
        var id = req.params.id;
        var data = await loginModel.findOne({ _id: uid })
        var post_img = await postModel.find({ userId: uid });
        var total_post = await postModel.count({ userId: uid });

        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        const followstatus = await loginModel.findById(uid);

        var postData = await postModel.find({ _id: id })

        if (postData.length > 0) {
            var likeData = postData[0].like;
            var likedUsers = await loginModel.find({ _id: { $in: likeData } });

            res.render('postlike', { data: data, total_post: total_post, post_img: post_img, followingCount: followingCount, followerCount: followerCount, followstatus: followstatus, likedUsers: likedUsers });
        }
    }
}

// ---- all comment on post ----

exports.allComment = async (req, res) => {
    await storage.init();
    var uid = await storage.getItem('userid');

    if (uid) {
        var data = await loginModel.findOne({ _id: uid })
        var post_img = await postModel.find({ "userId": uid });
        var total_post = await postModel.count({ userId: uid });

        const user = await loginModel.findById(uid);
        const followingCount = user.following.length;
        const followerCount = user.follower.length;

        const followstatus = await loginModel.findById(uid);

        var id = req.params.id;
        var postData = await commentModel.find({ postId: id })
        var commentUser = postData.map(comment => comment.commentUserId);
        var commentUserData = await loginModel.find({ _id: { $in: commentUser } });

        res.render('comment', { data: data, total_post: total_post, post_img: post_img, followingCount: followingCount, followerCount: followerCount, followstatus: followstatus, postData: postData, commentUserData: commentUserData });
    }
}