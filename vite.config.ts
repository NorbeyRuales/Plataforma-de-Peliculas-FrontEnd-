import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				// Con includePaths, ya NO uses "src/..." en @use.
				// Importa como "styles/_variables.scss" desde cualquier .scss
				additionalData: `@use "styles/_variables.scss" as *;`,
				includePaths: [path.resolve(__dirname, 'src')],
			},
		},
	},
})
