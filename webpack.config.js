const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/ui/index.js',
    mode: 'development',
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        port: 3000,
        hot: true,
        liveReload: true
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js'
    },
    resolve: {
        fallback: {
            "path": require.resolve("path-browserify"),
            "util": require.resolve("util/"),
            "stream": require.resolve("stream-browserify"),
            "os": require.resolve("os-browserify"),
        },
        extensions: ['.js', '.jsx', '.json']
    },
    externals: {
        "electron": 'commonjs electron'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|electron)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/ui/index.html',
            fileName: 'index.html'
        })
    ]
};
