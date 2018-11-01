var webpack = require("webpack");

module.exports = {
	mode: "production",
	devtool: 'source-map',
	output: {
		filename: 'app.min.js',
	},
  resolve: {
		alias: {
			jquery: "jquery/src/jquery",
		},
	},
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
};
