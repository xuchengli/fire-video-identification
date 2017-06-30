/**
 * Created by lixuc on 2017/6/14.
 */
module.exports = function(app, contextPath) {
    app.use(contextPath, require("./dashboard"));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send(err.message);
    });
};