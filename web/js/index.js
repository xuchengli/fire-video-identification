/**
 * Created by lixuc on 2017/6/14.
 */
import "uikit/dist/css/uikit.min.css";
import $ from "jquery";
import UIkit from "uikit";
import Icons from "uikit/dist/js/uikit-icons";

UIkit.use(Icons);

var bar = $("#progressbar")[0];

UIkit.upload("#uploader", {
    url: "/api/upload",
    name: "fire-video",
    mime: "video/*",
    dataType: "json",
    fail: e => {
        UIkit.notification("<span uk-icon='icon: warning'></span> Only video files are allowed!", "warning");
    },
    loadStart: e => {
        bar.removeAttribute("hidden");
        bar.max = e.total;
        bar.value = e.loaded;
    },
    progress: e => {
        bar.max = e.total;
        bar.value = e.loaded;
    },
    loadEnd: e => {
        bar.max = e.total;
        bar.value = e.loaded;
    },
    completeAll: e => {
        var response = e.responseJSON;
        setTimeout(() => bar.setAttribute("hidden", "hidden"), 1000);
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