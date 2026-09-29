const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}


const storage = multer.memoryStorage();

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { 
        fileSize: 50 * 1024, // strict 50KB limit per instructions
        files: 5 
    } 
});

module.exports = upload;
