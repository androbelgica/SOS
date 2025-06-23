import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.jsx"], // adjust as needed
            refresh: true,
        }),
    ],
    server: {
        https: true, // for local dev only
    },
    build: {
        outDir: "public/build",
        manifest: true,
        rollupOptions: {
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name]-[hash].js",
                assetFileNames: "[name][extname]",
                // Add this line to force manifest to root of build dir
                manualChunks: undefined,
            },
        },
    },
});