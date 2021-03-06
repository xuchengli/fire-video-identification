/**
 * Created by lixuc on 2017/6/15.
 */
var ffmpeg = require("fluent-ffmpeg");
var rp = require("request-promise");
var fs = require("fs");

class videoHandler {
    screenShot(input, output, time) {
        return new Promise((resolve, reject) => {
            ffmpeg(input).seekInput(time).output(output).noAudio().frames(1).on("end", () => {
                resolve(true);
            }).on("error", err => {
                reject(err);
            }).run();
        });
    }
    identify(api, file) {
        return new Promise((resolve, reject) => {
            rp({
                method: "POST",
                uri: api,
                formData: {
                    files: fs.createReadStream(file)
                },
                json: true
            }).then(response => {
                resolve(response);
            }).catch(err => {
                reject({ message: err.message || "Identify failed, please try again later!" });
            });
        });
    }
}
module.exports = videoHandler;
