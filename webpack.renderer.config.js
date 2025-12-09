const path = require("path");
const rules = require("./webpack.rules");

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

rules.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: "babel-loader",
  },
});

module.exports = {
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
    alias: {
      "@/data": path.resolve(__dirname, "src/back/data"),
    },
  },
};
