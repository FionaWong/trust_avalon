var webpack = require("webpack");

var path = require("path");
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
    entry: {
      productDetail: './dev/modules/productDetail/productDetail.js'

    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
        publicPath:"dist/"
    }, //页面引用的文件

    module: {

      loaders: [
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader!postcss-loader'
        },
        {
          test: /\.sass/,
          loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded&indentedSyntax'
        },
        {
          test: /\.scss/,
          loader: 'style-loader!css-loader!postcss-loader!sass-loader?outputStyle=expanded'
        },
        {
          test: /\.less/,
          loader: 'style-loader!css-loader!postcss-loader!less-loader'
        },
        {
          test: /\.styl/,
          loader: 'style-loader!css-loader!postcss-loader!stylus-loader'
        },
        {
          test: /\.(png|jpg|gif|woff|woff2)$/,
          loader: 'url-loader?limit=8192'
        },
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.(mp4|ogg|svg)$/,
          loader: 'file-loader'
        }
      ]
    },
    plugins: [commonsPlugin],
    resolve: {
        extensions: ['.js', "", ".css"],
        alias: {

        }
    }
}
