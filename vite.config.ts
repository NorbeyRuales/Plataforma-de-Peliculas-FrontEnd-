import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	css: {
		preprocessorOptions: {
					scss: {
						// inject variables into every scss file using the modern module system to avoid deprecation
						additionalData: `@use "src/styles/_variables.scss" as *;`
					}
		}
	}
})
