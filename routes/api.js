/**
 * Created by lixuc on 2017/6/14.
 */
var express = require("express");
var co = require("co");
var VideoHandler = require("../modules/video-handler");

var router = express.Router();
router.post("/upload", (req, res) => {
    co(function* () {
        var resp = { result: true };
        var videoHandler = new VideoHandler();

        var uploaded = yield videoHandler.upload(req, res);
        var metadata = yield videoHandler.getMetadata(uploaded.path);
        var thumbnails = yield videoHandler.capture(Object.assign(metadata, {
            originalname: uploaded.originalname,
            destination: uploaded.destination,
            filename: uploaded.filename,
            path: uploaded.path
        }));
        Object.assign(resp, metadata);
        res.json(Object.assign(resp, {
            thumbnails: thumbnails
        }));
    }).catch(err => {
        res.json({
            result: false,
            message: err.message
        });
    });
});
module.exports = router;