/**
 * Created by lixuc on 2017/6/23.
 */
import $ from "jquery";
import UIkit from "uikit";
import videojs from "video.js";
import Marker from "./marker";
import template from "../templates/player.pug";

var Plugin = videojs.getPlugin("plugin");
var $dom;
var $progressHolder;

class thumbnailMarker extends Plugin {
    constructor(player, options) {
        super(player, options);
        $progressHolder = $(".vjs-progress-holder");
        var duration = options.duration;
        var markers = options.markers;
        for (let marker of markers) {
            if (marker.labels.length > 0) {
                var left = marker.time / duration * 100;
                this.createMarker(left + "%", "25px", marker.labels);
            }
        }
    }
    createMarker(left, height, labels) {
        var marker = new Marker(left, height, labels);
        $progressHolder.append(marker.dom);
    }
}
videojs.registerPlugin("thumbnailMarker", thumbnailMarker);

class player {
    constructor(video) {
        $dom = $(template({ video: "video/" + video }));
        var dialog = UIkit.modal($dom);
        dialog.$el.on("hidden", e => {
            if (e.target === e.currentTarget) {
                dialog.$destroy(true);
            }
        });
        dialog.show();
    }
    init(markers) {
        var player = videojs($dom.find("video")[0], {
            autoplay: true,
            controls: true,
            preload: "auto",
            fluid: true
        });
        player.thumbnailMarker(markers);
        return player;
    }
}
export default player;
