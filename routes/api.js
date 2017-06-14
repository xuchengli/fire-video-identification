/**
 * Created by lixuc on 2017/6/14.
 */
var express = require("express");
var multer = require("multer");
var config = require("../modules/configuration");

var router = express.Router();
router.post("/upload", (req, res) => {
    var storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, config.Video_Upload_Dir);
        },
        filename: (req, file, cb) => {
            var idx = file.originalname.lastIndexOf(".");
            var fileName = file.originalname.substring(0, idx);
            var ext = file.originalname.substring(idx + 1);
            cb(null, fileName + "-" + Date.now() + "." + ext);
        }
    });
    var upload = multer({ storage: storage }).single("fire-video");
    upload(req, res, err => {
        if (err) {
            res.json({
                result: false,
                message: err.message
            });
        } else {
            res.json({
                result: true,
                name: req.file.filename
            })
        }
    });
});
module.exports = router;