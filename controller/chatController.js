const chatModel = require('../model/chatModel');
var storage = require('node-persist');
const loginModel = require('../model/loginModel');

exports.sendMsg = async (req, res) => {
    var id = req.query.chat_id;
    var msg = req.body.message;

    await storage.init();
    var uid = await storage.getItem('userid');

    var sender = await loginModel.findOne({ _id: uid });
    var receiver = await loginModel.findOne({ _id: id });

    var obj = {
        sender_id: uid,
        sender_name: sender.firstname + " " + sender.lastname,
        sender_profile: sender.profile_pic,
        receiver_id: id,
        receiver_name: receiver.firstname + " " + receiver.lastname,
        receiver_profile: receiver.profile_pic,
        message: msg
    };
    if (msg !== '') {
        await chatModel.create(obj);
    }
    // ---- last msg of conversation ----
    // await chatModel.findOneAndUpdate(
    //     { $or: [{ sender_id: uid, receiver_id: id }, { sender_id: id, receiver_id: uid }] },
    //     { $set: { lastMsg: msg } },
    //     { sort: { _id: -1 }, new: true }
    // );
    res.redirect('/chat?chat_id=' + id);
};
