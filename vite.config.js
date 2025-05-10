import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true
  },
  resolve: {
    alias: {
      "simple-peer": "simple-peer/simplepeer.min.js"
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"]
        }
      }
    },
    minify: "terser",
    terserOptions: {
      compress: {
        passes: 2
      },
      mangle: true,
      format: {
        comments: false
      }
    }
  }
});
