import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { Readable } from 'node:stream'

// Runs api/drive-video.js during `npm run dev`, the way Vercel runs it in production.
function driveVideoDev() {
  return {
    name: 'drive-video-dev',
    configureServer(server) {
      server.middlewares.use('/api/drive-video', async (req, res) => {
        const { GET } = await server.ssrLoadModule('/api/drive-video.js')
        const request = new Request(new URL(req.originalUrl, 'http://localhost'), { headers: req.headers })
        const response = await GET(request)
        res.statusCode = response.status
        response.headers.forEach((v, k) => res.setHeader(k, v))
        if (response.body) Readable.fromWeb(response.body).pipe(res)
        else res.end()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), 'VITE_'))
  return { plugins: [react(), tailwindcss(), driveVideoDev()] }
})
