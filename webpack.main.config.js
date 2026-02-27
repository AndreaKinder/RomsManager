import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: "./src/window/main.js",
  entry: "./src/window/main.js",
  resolve: {
    alias: {
      "@/data": path.resolve(__dirname, "src/back/data"),
    },
  },
};
