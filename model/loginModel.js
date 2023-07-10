const mongoose = require('mongoose')

const loginSchema = new mongoose.Schema({

    firstname: { type: String },
    lastname: { type: String },
    email: { type: String },
    password: { type: String },
    token: { type: String, default: "123" },
    profile_pic: { type: String, default: "/profile.jpg" },
    following: { type: Array },
    follower: { type: Array }

})

const loginModel = mongoose.model('login', loginSchema);

module.exports = loginModel