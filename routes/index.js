var express = require('express');
const { register, login, formLogin, feed, formregister, profile, explore, chat, trending, setting, profile_picPost, logout, follow, like, search, userfollowers, userfollowing, userProfile, postLike, allComment, postlike, deleteChat, deletePost, friend } = require('../controller/loginController');
var router = express.Router();
const multer = require('multer');
const { upload_post } = require('../controller/postController');
const { comment } = require('../controller/commentController');
const { sendMsg } = require('../controller/chatController');

// --- form-login ---

router.get('/',formLogin)
router.post('/',login)

// --- form-register ---

router.get('/form-register',formregister)
router.post('/form-register',register)

// --- feed ---

router.get('/feed',feed)
router.get('/follow/:id',follow);
router.get('/like/:id',like)
router.post('/comment/:id',comment);

// --- all like ---

router.get('/postlike/:id',postlike)
router.get('/comment/:id',allComment)

// --- followers / following ---

router.get('/followers/:id',userfollowers)
router.get('/following/:id',userfollowing)

// --- explore ---

router.get('/explore', explore)

// --- search ---

router.post('/search',search)

// --- chat ---

router.get('/chat', chat)
router.post('/chat',sendMsg)

// --- trending ---

router.get('/trending',trending)

// --- settings ---

router.get('/setting', setting)

// --- profile ---

router.get('/profile',profile)
router.get('/userprofile/:id',userProfile)
router.get('/deletepost/:id',deletePost)
router.get('/friend/:id',friend)

// --- logout ---

router.get('/logout', logout)

// ==========================================================================

// ---- upload image ----

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })

router.post('/feed',upload.single('myFile'),upload_post )

//---- profile photo update  ----

var storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload_profile = multer({ storage: storage1 })

router.post('/profile',upload_profile.single('myFile'),profile_picPost )

// =======================================================================

module.exports = router;
