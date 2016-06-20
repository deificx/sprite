var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.ts',
	output: {
		filename: 'index.js',
	},
	module: {
		loaders: [
			{
				test: /\.ts$/,
				loader: 'ts',
			},
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract("style-loader", "css-loader", "postcss-loader"),
			},
		],
	},
	plugins: [
		new ExtractTextPlugin("index.css"),
		new HtmlWebpackPlugin({
			favicon: 'graphics/favicon.ico',
		}),
	],
};
