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
        for (let marker of markers) {
            var left = marker.time / duration * 100;
            if (marker.fire) {
                this.createMarker(left + "%", "50px", "#f0506e");
            } else {
                this.createMarker(left + "%", "25px", "#32d296");
            }
        }
    }
    createMarker(left, height, color) {
        var marker = new Marker(left, height, color);
        $progressHolder.append(marker.dom);
    }
}
videojs.registerPlugin("thumbnailMarker", thumbnailMarker);

class player {
    constructor(video) {
        $dom = $(template({ video: "/video/" + video }));
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