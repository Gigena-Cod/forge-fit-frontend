import { defineConfig, loadEnv } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "API_URL");
  return {
    define: {
      "import.meta.env.API_URL": JSON.stringify(env.API_URL ?? "http://localhost:3000/api"),
    },
    plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  };
});
