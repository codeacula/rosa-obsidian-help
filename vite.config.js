/** @type {import('vite').UserConfig} */
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: "src/main.ts",
			formats: ["cjs"],
			fileName: "main",
		},
		rollupOptions: {
			external: ["obsidian", "electron"],
			output: {
				// Disable code splitting to bundle everything into a single file.
				inlineDynamicImports: true,
				dir: ".",
				format: "cjs",
				entryFileNames: "main.js",

				assetFileNames: (assetInfo) => {
					if (assetInfo.names.includes("main.css")) {
						return "styles.css";
					}
					return assetInfo.name;
				},
			},
		},
		// Stop build from clearing the outDir since it's the project root.
		emptyOutDir: false,
	},
});
