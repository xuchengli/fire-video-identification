/**
 * Created by lixuc on 2017/6/26.
 */
var webpack = require("webpack");
var path = require("path");
var CleanWebpackPlugin = require("clean-webpack-plugin");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var WebpackChunkHash = require("webpack-chunk-hash");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var InlineChunkManifestHtmlWebpackPlugin = require("inline-chunk-manifest-html-webpack-plugin");
var config = require("./modules/configuration");
var context = config.Context_Path == "/" ? "" : config.Context_Path;
var ai_vision_api = config.AI_VISION_API + "/dlapis/";

module.exports = {
    entry: "./web/js/index.js",
    output: {
        path: path.join(__dirname, "public"),
        filename: "js/[name].[chunkhash].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["env", {
                                "targets": {
                                    uglify: true
                                }
                            }]
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: {
                        loader: "css-loader",
                        options: {
                            minimize: true
                        }
                    }
                })
            },
            {
                test: /\.(png|jpg|gif|eot|svg|ttf|woff|woff2)$/,
                loader: "url-loader",
                options: {
                    name: "[hash:6].[ext]",
                    limit: 10000
                }
            },
            {
                test: /\.pug$/,
                use: "pug-loader"
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(["public"]),
        new ExtractTextPlugin("css/[name].[chunkhash].css"),
        new webpack.optimize.CommonsChunkPlugin({
            name: "vendor",
            minChunks: function (module) {
                return module.context && module.context.indexOf("node_modules") !== -1;
            }
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "manifest"
        }),
        new webpack.optimize.UglifyJsPlugin({
            comments: false
        }),
        new webpack.HashedModuleIdsPlugin(),
        new WebpackChunkHash(),
        new HtmlWebpackPlugin({
            template: "!!html-loader!pug-html-loader?{" +
                            "data: {" +
                                "env: 'production'," +
                                "context: '" + context + "'," +
                                "ai_vision_api: '" + ai_vision_api + "'" +
                            "}" +
                        "}!views/dashboard.pug"
        }),
        new InlineChunkManifestHtmlWebpackPlugin({
            dropAsset: true
        })
    ]
};
