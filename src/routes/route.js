const express = require('express');
const userController = require('../controllers/userController.js');
const router = express.Router();



router.post("/authors", userController.createAuthor)
router.post("/login", userController.authorLogin)


module.exports = router;