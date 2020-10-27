const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


module.exports = {
	entry: "./src/index.ts",

	target: "web",
	mode: "development",

	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js",
		publicPath: "/"
		//publicPath: "/src/public"
		// compress: true,
	},

	devServer: {
		compress: true,
		contentBase: path.join(__dirname, 'src', 'public'),

		stats: {
			warnings: false
		},
		port: 9000
	},

	resolve: {
		extensions: [".json", ".ts", ".js", ".css", ".scss"],
		plugins: [new TsconfigPathsPlugin({ configFile: "./tsconfig.json" })],
	},

	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/,
				loader: "ts-loader",
			},
			// {
			// 	enforce: "pre",
			// 	test: /\.js$/,
			// 	loader: "source-map-loader",
			// },
			{
				test: /\.(png|svg|ico|jpe?g|gif)$/i,
				use: [
					'file-loader',
				],
			},
		],
	},

	// plugins: [
	// 	new HtmlWebpackPlugin({
	// 		template: path.resolve(__dirname, "src", "public", "index.html"),
	// 	}),
	// ],
};
