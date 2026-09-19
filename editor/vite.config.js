import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The editor's own screen. The API lives on another port and is proxied in, so
// the browser only ever talks to one origin and there is no CORS to think about.
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
        open: true,
        proxy: { "/api": "http://localhost:5175" },
    },
});
