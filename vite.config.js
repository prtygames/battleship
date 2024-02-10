import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true
  },
  resolve: {
    alias: {
      "simple-peer": "simple-peer/simplepeer.min.js",
    },
  }
});
