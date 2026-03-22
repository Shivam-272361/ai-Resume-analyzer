const multer = require('multer');
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const pathName = path.join(__dirname, "..", "uploads");
        cb(null, pathName);
    },
    filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
}
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and DOCX allowed"), false);
    }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: fileFilter 
});

module.exports = upload;