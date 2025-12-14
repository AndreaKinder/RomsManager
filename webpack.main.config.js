const path = require("path");

module.exports = {
  entry: "./src/window/main.js",
  resolve: {
    alias: {
      "@/data": path.resolve(__dirname, "src/back/data"),
    },
  },
};
