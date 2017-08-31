/**
 * Created by lixuc on 2017/6/23.
 */
import $ from "jquery";
import videojs from "video.js";
import Marker from "./marker";
import template from "../templates/player.pug";

var Plugin = videojs.getPlugin("plugin");
var $video = $("#video");
var $dom;
var $progressHolder;

class thumbnailMarker extends Plugin {
    constructor(player, options) {
        super(player, options);
        $progressHolder = $(".vjs-progress-holder");
        var duration = options.duration;
        var markers = options.markers;
        for (let [index, marker] of markers.entries()) {
            if (marker.labels.length > 0) {
                var left = marker.time / duration * 100;
                this.createMarker(left + "%", index % 2 == 0 ? "25px" : "50px", marker.labels);
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
        $video.append($dom);
    }
    init(markers) {
        var player = videojs($dom[0], {
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
