module.exports.validateImage=function(file) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        return false;
    }return true;
};