const express = require('express');
const userController = require('../controllers/userController.js');
const blogController =require('../controllers/blogController.js')
const router = express.Router();
const midware = require("../middlewares/commonMidleware")



router.post("/authors", userController.createAuthor)
router.post("/login", userController.authorLogin)

router.post("/blogs",midware.auth, blogController.createblog)
router.get("/blogs",midware.auth, blogController.getBlog)

router.put("/blogs/:blogId",midware.auth, blogController.updateBlog)

router.delete("/blogs/:blogId",midware.auth, blogController.deleteBlog)



module.exports = router;