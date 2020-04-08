const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: {
		index: "./src/index.ts"
	},

	output: {
		path: path.resolve(__dirname, "dist"),
		publicPath: '/'
	},
	devtool: "source-map",
	resolve: {
		extensions: [".ts", ".js", ".json"]
	},
	module: {
		rules: [
			{ test: /\.ts$/, loader: 'awesome-typescript-loader' }
		]
	},
	plugins: [
		new CleanWebpackPlugin()
	]
}