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
        extensions: ['.js', '.jsx', '.json', '.tsx', '.ts']
    },
    externals: {
        "electron": 'commonjs electron',
        "fs": 'commonjs fs'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx)$/,
                exclude: /(node_modules|electron)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
              },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/ui/index.html',
            fileName: 'index.html'
        })
    ]
};
