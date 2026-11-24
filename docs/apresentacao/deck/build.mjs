// Gera index.html a partir de template.html, embutindo os SVGs (abre direto do disco, sem servidor).
import { readFileSync, writeFileSync } from 'node:fs'

const svg = f => readFileSync(new URL(f, import.meta.url), 'utf8').replace(/<\?xml[^>]*>/, '').replace(/<title>[^<]*<\/title>/, '').trim()
const html = readFileSync(new URL('template.html', import.meta.url), 'utf8')
  .replaceAll('{{LOGO}}', svg('assets/logo.svg'))
  .replaceAll('{{ISO}}', svg('assets/isolinhas.svg'))
writeFileSync(new URL('index.html', import.meta.url), html)
console.log('index.html gerado')
