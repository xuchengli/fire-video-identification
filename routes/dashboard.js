/**
 * Created by lixuc on 2017/6/14.
 */
var express = require("express");
var ffmpeg = require("fluent-ffmpeg");
var router = express.Router();

router.get("/", function(req, res) {
    res.render("dashboard");
});
router.get("/video", (req, res) => {
    res.contentType("flv");
    ffmpeg(req.query.path).preset("flashvideo").size("580x?").on("end", () => {
        console.log("file has been converted succesfully");
    }).on("error", err => {
        console.log("an error happened: " + err.message);
    }).pipe(res, { end: true });
});
module.exports = router;