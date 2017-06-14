/**
 * Created by lixuc on 2017/6/14.
 */
var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var app = express();
var env = process.env.NODE_ENV || "production";

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.locals.env = env;

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

    require("./routes")(app);

    var reload = require("reload");
    var http = require("http");
    var server = http.createServer(app);
    reload(server, app);
    server.listen(8080, function() {
        console.log("Development server started>>>");
    });
} else {
    app.use(express.static(path.join(__dirname, "public")));
    require("./routes")(app);
    app.listen(8080, function() {
        console.log("Server started>>>");
    });
}