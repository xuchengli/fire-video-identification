/**
 * Created by lixuc on 2017/6/23.
 */
import $ from "jquery";
import videojs from "video.js";
import Marker from "./marker";
import template from "../templates/player.pug";
import leafIcon from "../images/leaf.png";
import flameIcon from "../images/flame.png";
import blankIcon from "../images/blank-circle.png";
import happyIcon from "../images/happy.png";
import angryIcon from "../images/angry.png";
import surprisedIcon from "../images/surprised.png";

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
            if (marker.hasOwnProperty("fire")) {
                if (marker.fire) {
                    this.createMarker(marker.thumbnail, left + "%", "50px", "#f0506e", flameIcon);
                } else {
                    this.createMarker(marker.thumbnail, left + "%", "25px", "#32d296", leafIcon);
                }
            } else if (marker.hasOwnProperty("emotion")) {
                if (marker.emotion && marker.emotion.happy) {
                    this.createMarker(marker.thumbnail, left + "%", "50px", "#32d296", happyIcon);
                } else if (marker.emotion && marker.emotion.angry) {
                    this.createMarker(marker.thumbnail, left + "%", "50px", "#f0506e", angryIcon);
                } else if (marker.emotion && marker.emotion.surprised) {
                    this.createMarker(marker.thumbnail, left + "%", "50px", "#faa05a", surprisedIcon);
                } else {
                    this.createMarker(marker.thumbnail, left + "%", "25px", "#ebebed", blankIcon);
                }
            }
        }
    }
    createMarker(src, left, height, color, icon) {
        var marker = new Marker(src, left, height, color, icon);
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
