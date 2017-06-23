/**
 * Created by lixuc on 2017/6/14.
 */
var express = require("express");
var multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");
var fs = require("fs");
var co = require("co");
var config = require("../modules/configuration");
var VideoHandler = require("../modules/video-handler");
var router = express.Router();

router.get("/", function(req, res) {
    res.render("dashboard");
});
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
                file: req.file
            });
        }
    });
});
router.ws("/", (ws, req) => {
    ws.on("message", msg => {
        /**
         * message: {
         *     status: 100/200/...
         *     data: {
         *     },
         *     error: "xxx" (optional)
         * }
         */
        var message = JSON.parse(msg);
        /**
         * status code:
         * 100 => convert video to mp4 format
         *      101 => the percent of convert progress
         *      102 => convert success
         *      103 => convert fail
         * 200 => probe video metadata
         *      201 => the percent of probe
         *      202 => probe success
         *      203 => probe fail
         * 300 => extract video screenshot
         *      301 => the percent of extract
         *      302 => extract success
         *      303 => extract fail
         * 400 => identify video
         *      401 => the percent of identification
         *      402 => identify success
         *      403 => identify fail
         */
        if (message.status == 100) {
            var filename = message.data.filename;
            var mp4 = filename.substring(0, filename.lastIndexOf(".")) + ".mp4";
            ffmpeg(config.Video_Upload_Dir + "/" + filename).on("progress", info => {
                ws.send(JSON.stringify({
                    status: 101,
                    data: { percent: parseFloat(info.percent).toFixed(2) }
                }));
            }).on("end", () => {
                ws.send(JSON.stringify({
                    status: 102,
                    data: { filename: mp4 }
                }));
            }).on("error", err => {
                ws.send(JSON.stringify({
                    status: 103,
                    error: err.message
                }));
            }).format("mp4").save(config.Video_Upload_Dir + "/" + mp4);
        } else if (message.status == 200) {
            var filename = message.data.filename;
            ffmpeg(config.Video_Upload_Dir + "/" + filename).on("progress", info => {
                ws.send(JSON.stringify({
                    status: 201,
                    data: { percent: parseFloat(info.percent).toFixed(2) }
                }));
            }).ffprobe((err, metadata) => {
                if (err) {
                    ws.send(JSON.stringify({
                        status: 203,
                        error: err.message
                    }));
                } else {
                    var stream = metadata.streams[0];
                    var format = metadata.format;
                    ws.send(JSON.stringify({
                        status: 202,
                        data: {
                            filename: filename,
                            width: stream.width,
                            height: stream.height,
                            size: format.size,
                            duration: stream.duration,
                            frame_rate: stream.avg_frame_rate,
                            frame_number: stream.nb_frames
                        }
                    }));
                }
            });
        } else if (message.status == 300) {
            co(function* () {
                var filename = message.data.filename;
                var duration = message.data.duration;
                var videoHandler = new VideoHandler();
                var thumbnailFolder = config.Video_Upload_Dir + "/thumbnails";
                if (!fs.existsSync(thumbnailFolder)) {
                    fs.mkdirSync(thumbnailFolder);
                }
                var times = [], files = [];
                for (var i=1; i<duration; i+=config.Second_Per_Capture) {
                    times.push(i);
                }
                var input = config.Video_Upload_Dir + "/" + filename;
                for (var i=0, len=times.length; i<len; i++) {
                    var output = thumbnailFolder + "/" +
                                 filename.substring(0, filename.lastIndexOf(".")) +
                                 "@" + times[i] + "s-" + (i + 1) + ".png";
                    var screenshot = yield videoHandler.screenShot(input, output, times[i]);
                    if (screenshot) {
                        files.push(output);
                        if (i < len - 1) {
                            var per = parseFloat((i + 1) / len * 100).toFixed(2);
                            ws.send(JSON.stringify({
                                status: 301,
                                data: { percent: parseFloat(per) }
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                status: 302,
                                data: {
                                    video: filename,
                                    duration: duration,
                                    files: files
                                }
                            }));
                        }
                    }
                }
            }).catch(err => {
                ws.send(JSON.stringify({
                    status: 303,
                    error: err.message
                }));
            });
        } else if (message.status == 400) {
            co(function* () {
                var files = message.data.files;
                var videoHandler = new VideoHandler();
                var identifications = [];
                for (var i=0, len=files.length; i<len; i++) {
                    var file = files[i];
                    var identification = yield videoHandler.identify(file);
                    var identified = {
                        result: identification.result === "success",
                        thumbnail: file
                    };
                    if (identified.result) {
                        Object.assign(identified, {
                            imageUrl: identification.imageUrl,
                            classified: identification.classified
                        });
                        identifications.push(identified);
                        if (i < len - 1) {
                            var per = parseFloat((i + 1) / len * 100).toFixed(2);
                            ws.send(JSON.stringify({
                                status: 401,
                                data: { percent: parseFloat(per) }
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                status: 402,
                                data: {
                                    video: message.data.video,
                                    duration: message.data.duration,
                                    identifications: identifications
                                }
                            }));
                        }
                    }
                }
            }).catch(err => {
                ws.send(JSON.stringify({
                    status: 403,
                    error: err.message
                }));
            });
        }
    });
});
router.get("/video/:name", (req, res) => {
    res.sendFile(req.params.name, {
        root: config.Video_Upload_Dir,
        headers: { "Content-Type": "video/mp4" }
    });
});
module.exports = router;