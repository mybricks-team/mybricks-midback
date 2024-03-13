import { defineConfig } from "father";

export default defineConfig({
  esm: {},
  umd: {
    name: "MybircksLoader",
    output: {
      filename: "index.js",
    },
  },
  platform: "browser",
});
