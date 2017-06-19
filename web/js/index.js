/**
 * Created by lixuc on 2017/6/14.
 */
import "uikit/dist/css/uikit.min.css";
import "video.js/dist/video-js.min.css";
import "../css/style.css";
import $ from "jquery";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";
import videojs from "video.js";
import "videojs-flash";
import template from "../templates/identification.pug";

UIkit.use(Icons);

var $uploader = $("#uploader");
var $fileInput = $("#uploader input");
var $uploadBtn = $("#uploader button");
var $spinner = $("<div class='uk-margin-left' uk-spinner></div>");

UIkit.upload("#uploader", {
    url: "/api/upload",
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
    },
    completeAll: e => {
        var response = e.responseJSON;
        $fileInput.removeAttr("disabled");
        $uploadBtn.removeAttr("disabled");
        $spinner.remove();
        if (response.result) {
            UIkit.notification("<span uk-icon='icon: check'></span> Identify Completed!", "success");
            var screenshots = [];
            var identifications = response.identifications;
            for (let identification of identifications) {
                if (identification.result && identification.classified) {
                    var fire = identification.classified.fire;
                    if (fire && parseFloat(fire) >= 0.8) {
                        var thumbnail = identification.thumbnail;
                        var start = thumbnail.lastIndexOf("@");
                        var end = thumbnail.lastIndexOf("-");
                        var ts = parseFloat(thumbnail.substring(start + 1, end)).toFixed(2);
                        screenshots.push({
                            url: identification.imageUrl,
                            timestamp: "@" + parseFloat(ts) + "s"
                        });
                    }
                }
            }
            $("body").append(template({
                video: "/video?path=" + response.path,
                screenshots: screenshots
            }));
            videojs("player", {
                autoplay: true,
                controls: true,
                preload: "auto",
                techOrder: ["flash", "html5"]
            });
        } else {
            UIkit.notification("<span uk-icon='icon: close'></span> " + response.message, "danger");
        }
    },
    error: e => {
        UIkit.notification("<span uk-icon='icon: close'></span> Upload failed, please try again later!", "danger");
    }
});