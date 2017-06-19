/**
 * Created by lixuc on 2017/6/14.
 */
var webpack = require("webpack");

module.exports = {
    entry: [
        "webpack-hot-middleware/client?reload=true",
        "./web/js/index.js"
    ],
    output: {
        filename: "bundle.js",
        publicPath: "/"
    },
    module: {
        rules: [
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: "file-loader"
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.pug$/,
                use: "pug-loader"
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ]
};