// Serve o deck em http://localhost:4310 (só nesta máquina). Uso: node docs/apresentacao/deck/servir.mjs
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, normalize, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const port = +process.argv[2] || 4310
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '')
  const file = join(root, path || 'index.html')
  if (!file.startsWith(root)) {
    res.writeHead(403).end()
    return
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body)
  }
  catch { res.writeHead(404).end('não encontrado') }
}).listen(port, '127.0.0.1', () => console.log(`Apresentação em http://localhost:${port}/  (F para tela cheia)`))
