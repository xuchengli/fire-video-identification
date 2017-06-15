/**
 * Created by lixuc on 2017/6/14.
 */
import "uikit/dist/css/uikit.min.css";
import "../css/style.css";
import $ from "jquery";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";

UIkit.use(Icons);

var $uploader = $("#uploader");
var $fileInput = $("#uploader input");
var $uploadBtn = $("#uploader button");
var $spinner = $("<div class='uk-margin-left' uk-spinner></div>");
var $bar = $("#progressbar");

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
        $bar.show();
        $bar.attr("max", e.total);
        $bar.attr("value", e.loaded);
    },
    progress: e => {
        $bar.attr("max", e.total);
        $bar.attr("value", e.loaded);
    },
    loadEnd: e => {
        $bar.attr("max", e.total);
        $bar.attr("value", e.loaded);
    },
    completeAll: e => {
        var response = e.responseJSON;
        $bar.fadeOut("slow");
        $fileInput.removeAttr("disabled");
        $uploadBtn.removeAttr("disabled");
        $spinner.remove();
        if (response.result) {
            UIkit.notification("<span uk-icon='icon: check'></span> Upload Completed!", "success");
        } else {
            UIkit.notification("<span uk-icon='icon: close'></span> " + response.message, "danger");
        }
    },
    error: e => {
        UIkit.notification("<span uk-icon='icon: close'></span> Upload failed, please try again later!", "danger");
    }
});