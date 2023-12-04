import { defineConfig } from 'vite'
import sdk from 'vite-plugin-sdk'

export default defineConfig({
  build: {
    sourcemap: false,
  },
  plugins: [sdk()],
})
