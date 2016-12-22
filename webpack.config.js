var path = require('path')
var webpack = require('webpack')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
    entry: [path.resolve('docs/index.js')],
    output: {
        path: path.join(__dirname, 'docs/build'),
        filename: 'bundle.js',
        publicPath: 'docs/build/',
    },
    externals: {
        "react": 'react',
        'react-dom': 'ReactDOM'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel'
            }, {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract('style', 'css')
            }, {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract('css!less')
            }, {
                test: /\.md$/,
                loaders: ['html-loader']
            }
        ],
    },
    resolve: {
        alias: {

        },
        extensions: ['', '.js', '.jsx'],
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new webpack.HotModuleReplacementPlugin({ quiet: true }),
        new webpack.NoErrorsPlugin(),
    ],
    quiet: true,
}
