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
		],
	},
};
