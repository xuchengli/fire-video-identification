/**
 * Created by lixuc on 2017/6/14.
 */
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var expressWs = require("express-ws");
var config = require("./modules/configuration");
var app = express();
var env = process.env.NODE_ENV || "production";

expressWs(app);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.env = env;
app.locals.context = config.Context_Path == "/" ? "" : config.Context_Path;
app.locals.ai_vision_api = config.AI_VISION_API + "/dlapis/";

if (env == "development") {
    var webpack = require("webpack");
    var webpackDevMiddleware = require("webpack-dev-middleware");
    var webpackHotMiddleware = require("webpack-hot-middleware");
    var webpackDevConfig = require("./webpack.dev");
    var compiler = webpack(webpackDevConfig);

    app.use(webpackDevMiddleware(compiler, {
        publicPath: webpackDevConfig.output.publicPath,
        noInfo: true,
        stats: {
            colors: true
        }
    }));
    app.use(webpackHotMiddleware(compiler));
} else {
    app.use(config.Context_Path, express.static(path.join(__dirname, "public")));
}
require("./routes")(app, config.Context_Path);
app.listen(8080, function() {
    console.log("Server started>>>");
});
