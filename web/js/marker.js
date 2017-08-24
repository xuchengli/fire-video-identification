/**
 * Created by lixuc on 2017/6/23.
 */
import $ from "jquery";
import markerTemplate from "../templates/marker.pug";
import thumbnailTemplate from "../templates/thumbnail.pug";

var $dom, thumbnails = {};
class marker {
    constructor(src, left, height, color, icon) {
        $dom = $(markerTemplate({
            src: src,
            left: left,
            height: height,
            color: color,
            icon: icon
        }));
        thumbnails[src] = $(thumbnailTemplate({
            src: src,
            top: (parseInt(height) + 30) + "px",
            left: left
        }));
        $dom.hover(evt => {
            var $this = $(evt.currentTarget);
            $this.parent().append(thumbnails[$this.data("src")]);
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
