const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './index.js',
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
            {
                test: /\.s[ac]ss$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/img/[name][ext]'
                }
            },
            {
                test:/\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/font/[name][ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            fileName: 'index.html',
            minify: {
                removeComments: false
            }
        })
    ]
};
