/**
 * Created by lixuc on 2017/6/14.
 */
import "uikit/dist/css/uikit.css";
import "video.js/dist/video-js.css";
import "../css/style.css";
import $ from "jquery";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import Progress from "./progress";
import Player from "./player";

UIkit.use(Icons);

var location = window.location, wsURL;
if (location.protocol == "https:") {
    wsURL = "wss:";
} else {
    wsURL = "ws:";
}
wsURL += "//" + location.host + location.pathname;
var socket = new WebSocket(wsURL);
var $uploader = $("#uploader");
var $fileInput = $("#uploader input");
var $uploadBtn = $("#uploader button");
var $spinner = $("<div class='uk-margin-left' uk-spinner></div>");
var $progressContainer = $("#progress");
var progress;

UIkit.upload("#uploader", {
    url: "/upload",
    name: "fire-video",
    mime: "video/*",
    dataType: "json",
    fail: e => {
        UIkit.notification("<span uk-icon='icon: warning'></span> Only video files are allowed!", "warning");
    },
    loadStart: e => {
        $fileInput.attr("disabled", true);
        $uploadBtn.attr("disabled", true);
        $uploader.after($spinner);
        progress = new Progress("1. Upload the video");
        $progressContainer.append(progress.dom);
    },
    progress: e => {
        var per = parseFloat(e.loaded / e.total * 100).toFixed(2);
        var value = parseFloat(per) + "%";
        progress.sync(value);
    },
    completeAll: e => {
        progress.sync("100%");
        var response = e.responseJSON;
        if (response.result) {
            progress.done();
            var file = response.file;
            var mp4 = file.mimetype == "video/mp4";
            if (!mp4) {
                progress = new Progress("2. Process the video");
                $progressContainer.append(progress.dom);
                socket.send(JSON.stringify({
                    status: 100,
                    data: { filename: file.filename }
                }));
            } else {
                progress = new Progress("2. Probe the video metadata");
                $progressContainer.append(progress.dom);
                socket.send(JSON.stringify({
                    status: 200,
                    data: { filename: file.filename }
                }));
            }
            socket.addEventListener("message", event => {
                var message = JSON.parse(event.data);
                switch(message.status) {
                    case 101:case 201:case 301:case 401:
                        var value = message.data.percent + "%";
                        progress.sync(value);
                        break;
                    case 102:
                        progress.sync("100%").done();
                        progress = new Progress("3. Probe the video metadata");
                        $progressContainer.append(progress.dom);
                        socket.send(JSON.stringify({
                            status: 200,
                            data: { filename: message.data.filename }
                        }));
                        break;
                    case 103:case 203:case 303:case 403:
                        UIkit.notification("<span uk-icon='icon: close'></span> " + message.error, "danger");
                        progress.fail();
                        break;
                    case 202:
                        progress.sync("100%").done();
                        progress = new Progress((mp4 ? 3 : 4) + ". Extract the video screenshots");
                        $progressContainer.append(progress.dom);
                        socket.send(JSON.stringify({
                            status: 300,
                            data: {
                                filename: message.data.filename,
                                duration: message.data.duration
                            }
                        }));
                        break;
                    case 302:
                        progress.sync("100%").done();
                        progress = new Progress((mp4 ? 4 : 5) + ". Identify the video");
                        $progressContainer.append(progress.dom);
                        socket.send(JSON.stringify({
                            status: 400,
                            data: {
                                video: message.data.video,
                                duration: message.data.duration,
                                files: message.data.files
                            }
                        }));
                        break;
                    case 402:
                        progress.sync("100%").done();
                        var markers = [];
                        var identifications = message.data.identifications;
                        for (let identification of identifications) {
                            if (identification.result && identification.classified) {
                                var fire = identification.classified.fire;
                                var thumbnail = identification.thumbnail;
                                var start = thumbnail.lastIndexOf("@");
                                var end = thumbnail.lastIndexOf("s-");
                                var time = thumbnail.substring(start + 1, end);
                                markers.push({
                                    time: time,
                                    thumbnail: identification.imageUrl,
                                    fire: fire && parseFloat(fire) >= 0.8
                                });
                            }
                        }
                        var player = new Player(message.data.video);
                        player.init({
                            duration: message.data.duration,
                            markers: markers
                        });
                        $fileInput.removeAttr("disabled");
                        $uploadBtn.removeAttr("disabled");
                        $spinner.remove();
                        break;
                }
            });
        } else {
            UIkit.notification("<span uk-icon='icon: close'></span> " + response.message, "danger");
            progress.fail();
        }
    },
    error: e => {
        UIkit.notification("<span uk-icon='icon: close'></span> Upload failed, please try again later!", "danger");
    }
});