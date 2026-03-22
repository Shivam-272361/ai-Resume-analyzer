const express = require('express');
const router = express.Router();
const upload = require('../config/multer');

const {uploadResume} = require("../controllers/uploadResume");

router.post("/upload",upload.single('resume'), uploadResume);

module.exports = router;