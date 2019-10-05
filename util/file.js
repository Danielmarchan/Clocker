const fs = require('fs');

const deleteFile = (filePath) => {
    correctPath = './' + filePath;

    fs.unlink(correctPath, (err) => {});
}

exports.deleteFile = deleteFile;
