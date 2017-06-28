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
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: "url-loader"
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
            template: "views/dashboard.pug"
        }),
        new InlineChunkManifestHtmlWebpackPlugin({
            dropAsset: true
        })
    ]
};