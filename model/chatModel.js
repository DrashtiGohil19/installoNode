const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({

    sender_id: { type:String },
    sender_name: { type:String },
    sender_profile: { type:String },
    receiver_id: { type:String },
    receiver_name: { type:String },
    receiver_profile: { type:String },
    message: { type:String },

})

const chatModel = mongoose.model('chat',chatSchema);

module.exports = chatModel;