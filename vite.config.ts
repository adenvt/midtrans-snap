import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build  : {
    lib: {
      entry   : fileURLToPath(new URL('src/index.ts', import.meta.url)),
      name    : 'MidtransSnap',
      fileName: 'midtrans-snap',
      formats : [
        'es',
        'umd',
        'iife',
      ],
    },
  },
})
