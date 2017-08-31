/**
 * Created by lixuc on 2017/6/23.
 */
import $ from "jquery";
import markerTemplate from "../templates/marker.pug";
import thumbnailTemplate from "../templates/thumbnail.pug";

var $dom, thumbnails = {};
class marker {
    constructor(left, height, labels) {
        $dom = $(markerTemplate({
            left: left,
            height: height,
            labels: labels
        }));
        for (let label of labels) {
            if (!thumbnails[label.src]) {
                thumbnails[label.src] = $(thumbnailTemplate({
                    src: label.src,
                    left: left
                }));
            }
        }
        $dom.find(".marker-leaf").hover(evt => {
            var $this = $(evt.currentTarget);
            $this.parents(".vjs-progress-holder").append(thumbnails[$this.data("src")]);
        }, evt => {
            var $this = $(evt.currentTarget);
            thumbnails[$this.data("src")].remove();
        });
    }
    get dom() {
        return $dom;
    }
}
export default marker;
