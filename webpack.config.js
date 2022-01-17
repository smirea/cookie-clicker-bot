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
        extensions: ['.ts', '.tsx', '.styl'],
        plugins: [],
        alias: {
            src: path.resolve('./src'),
            'react': 'preact/compat',
            'react-dom/test-utils': 'preact/test-utils',
            'react-dom': 'preact/compat',     // Must be below test-utils
            'react/jsx-runtime': 'preact/jsx-runtime',
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
                            transpileOnly: true,
                        },
                    },
                ],
            },
            {
                test: /\.styl$/,
                exclude: /node_modules/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: 'Automator_[local]__[hash:base64:5]',
                            },
                        },
                    },
                    'stylus-loader',
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
