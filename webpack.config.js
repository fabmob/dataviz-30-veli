const path = require("path")

module.exports = {
  entry: "./frontend/index.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  mode: "development",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
        'chart.js': path.resolve(
          __dirname,
          'node_modules',
          'chart.js',
          'dist',
          'chart.js'
        ),
        'chartjs-adapter-luxon': path.resolve(
          __dirname,
          'node_modules',
          'chartjs-adapter-luxon',
          'dist',
          'chartjs-adapter-luxon.esm.js'
        )
    }
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "public"),
  },
}