/**
 * Created by lixuc on 2017/6/21.
 */
import $ from "jquery";
import template from "../templates/progress.pug";

var $dom, $badge, $bar;
class progress {
    constructor(title) {
        $dom = $(template({ title: title }));
        $badge = $dom.find(".uk-float-right span");
        $bar = $dom.find(".uk-progress-bar");
    }
    get dom() {
        return $dom;
    }
    sync(value) {
        $bar.css("width", value).text(value);
        return this;
    }
    done() {
        $badge.addClass("uk-text-success").html("<span uk-icon='icon: check'></span> Success");
    }
    fail() {
        $badge.addClass("uk-text-danger").html("<span uk-icon='icon: close'></span> Fail");
    }
}
export default progress;