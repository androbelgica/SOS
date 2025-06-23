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
        manifest: true,
        outDir: "public/build",
        // Add this line to ensure manifest is at the root of build output
        manifest: true,
        rollupOptions: {
            output: {
                // Ensure no subfolder for manifest
                entryFileNames: "[name].js",
                chunkFileNames: "[name]-[hash].js",
                assetFileNames: "[name][extname]",
            },
        },
    },
});