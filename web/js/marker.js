/**
 * Created by lixuc on 2017/6/23.
 */
import $ from "jquery";
import template from "../templates/marker.pug";

var $dom;
class marker {
    constructor(left, height, color) {
        $dom = $(template({
            left: left,
            height: height,
            color: color
        }));
    }
    get dom() {
        return $dom;
    }
}
export default marker;