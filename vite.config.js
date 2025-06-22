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
    },
});
