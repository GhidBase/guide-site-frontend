import { defineConfig, loadEnv } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    // Load .env file explicitly so values are available for both client and
    // server-side code (loaders now run on the server in framework mode)
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [
            tailwindcss(),
            process.env.VITEST ? react() : reactRouter(),
        ],
        define: {
            // Statically replace these in ALL code (client + SSR server bundle)
            "import.meta.env.VITE_LDG": JSON.stringify(env.VITE_LDG || ""),
            "import.meta.env.VITE_SERVER": JSON.stringify(
                env.VITE_SERVER || "",
            ),
            "import.meta.env.VITE_IGNORE_VIEWS": JSON.stringify(
                env.VITE_IGNORE_VIEWS || "",
            ),
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
        test: {
            globals: true,
            environment: "jsdom",
            setupFiles: "./src/tests/setup.js",
        },
    };
});
