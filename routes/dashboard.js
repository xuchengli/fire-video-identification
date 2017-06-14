/**
 * Created by lixuc on 2017/6/14.
 */
var express = require("express");
var router = express.Router();

router.get("/", function(req, res) {
    res.render("dashboard");
});
module.exports = router;