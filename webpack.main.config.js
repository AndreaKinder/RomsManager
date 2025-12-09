import path from "path";

module.exports = {
  entry: "./src/window/main.js",
  module: {
    rules: require("./webpack.rules"),
  },
  resolve: {
    alias: {
      "@/data": path.resolve(__dirname, "src/back/data"),
    },
  },
};
