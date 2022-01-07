const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'development',
    target: 'node',
    devtool: 'eval',

    entry: './src/index.ts',

    output: {
        pathinfo: true,
        path: path.resolve('dist'),
        filename: 'CookieBot.js',
        globalObject: 'this',
    },

    resolve: {
        extensions: ['.ts'],
        plugins: [],
        alias: {
            src: path.resolve('./src'),
        },
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules|jest|__tests__/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        },
                    },
                ],
            },
        ],
    },

    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            })
        ],
    },

};
