import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import flattenOutput from "vite-plugin-flatten-output";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig(() => {
	const PLUGINS = [
		react(),
		flattenOutput({
			removeDirs: ["src/pages/main", "src/pages/option"],
			filePattern: ".html",
		}),
	];

	// Disederhanakan karena manifest-firefox.json telah dihapus
	console.log("Using Chrome manifest.json");
	PLUGINS.push(
		viteStaticCopy({
			targets: [
				{
					src: "src/manifest-chrome.json",
					dest: ".",
					rename: "manifest.json",
				},
			],
		})
	);

	return {
		plugins: PLUGINS,
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		build: {
			rollupOptions: {
				input: {
					popup: path.resolve(__dirname, "src/pages/main/popup.html"),
					nested: path.resolve(__dirname, "src/pages/option/option.html"),
					contentFt: path.resolve(__dirname, "src/content-ft.js"),
					background: path.resolve(__dirname, "src/background.ts"),
				},
				output: {
					entryFileNames: (chunkInfo) => {
						if (chunkInfo.name === "background") return "background.js";
						if (chunkInfo.name === "contentFt") return "content-ft.js";
						return "assets/[name]-[hash].js";
					},
					banner: `/*!
 * myudakk/SiapDips v1.0.0
 * Copyright (c) ${new Date().getFullYear()} myyudak
 * Licensed under the MIT License
 */`,
				},
			},
			emptyOutDir: true,
		},
	};
});
