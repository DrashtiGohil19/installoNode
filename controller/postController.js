const loginModel = require('../model/loginModel');
const postModel = require('../model/postModel')
const storage = require('node-persist')

exports.upload_post = async (req,res) => {
    await storage.init();
    var user_id = await storage.getItem('userid');
    var file = req.file.originalname;
    var user_detail = await loginModel.findById(user_id);

    var obj = {
        "userId":user_id,
        "image":file,
        "thumbnail":user_detail.profile_pic,
        "username":user_detail.firstname+" "+user_detail.lastname
    }
    await postModel.create(obj);
    res.redirect('/feed');
}