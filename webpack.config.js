// Import path for resolving file paths
var path = require("path");
module.exports = {
  // Specify the entry point for our app.
  entry: [
    path.join(__dirname, "main.js")
  ],
  mode: "production",
  target: "node",
  node: {
    __dirname: false,
  },
  // Specify the output file containing our bundled code
  output: {
    path: path.join(__dirname, "dist"),
    filename: "index.js",
    clean: true
  },
  externals: [
    {
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      express: "commonjs express",
      "node-media-server": "commonjs node-media-server"
    },
  ],
  module: {
    /**
      * Tell webpack how to load 'json' files. 
      * When webpack encounters a 'require()' statement
      * where a 'json' file is being imported, it will use
      * the json-loader.  
      */
    rules: [
      /*{
        test: /\.json$/, 
        loaders: ['json']
      }*/
      {
        test: /\.node$/,
        loader: "node-loader"
      }
    ]
  }
}