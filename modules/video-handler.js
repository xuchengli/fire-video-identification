/**
 * Created by lixuc on 2017/6/15.
 */
var ffmpeg = require("fluent-ffmpeg");
var multer = require("multer");
var config = require("./configuration");

class videoHandler {
    upload(req, res) {
        return new Promise((resolve, reject) => {
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
                if (err) reject(err);
                else resolve(req.file);
            });
        });
    }
    getMetadata(file) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(file, (err, metadata) => {
                if (err) reject(err);
                else {
                    var stream = metadata.streams[0];
                    var format = metadata.format;
                    resolve({
                        width: stream.width,
                        height: stream.height,
                        size: format.size,
                        duration: stream.duration,
                        frame_rate: stream.avg_frame_rate,
                        frame_number: stream.nb_frames
                    });
                }
            });
        });
    }
    capture(metadata) {
        return new Promise((resolve, reject) => {
            var files = [];
            ffmpeg(metadata.path).on("filenames", filenames => {
                files = filenames;
            }).on("end", () => {
                resolve(files);
            }).on("error", err => {
                reject(err);
            }).screenshots({
                count: Math.round(metadata.duration / config.Second_Per_Capture),
                folder: metadata.destination + "/thumbnails",
                filename: metadata.filename.substring(0, metadata.filename.lastIndexOf(".")) + "@%s-%i.png"
            });
        });
    }
}
module.exports = videoHandler;