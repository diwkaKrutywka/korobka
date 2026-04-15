/**
 * Silent Print Server для термопринтера CUSTOM TG2480-H
 * Запускать: node server.js
 * Слушает:   http://127.0.0.1:7878
 */

const http    = require('http')
const printer = require('@thiagoelg/node-printer')

const PORT         = 7878
const PRINTER_NAME = process.env.PRINTER_NAME || '' // пусто = принтер по умолчанию

// ─── Список принтеров при старте ─────────────────────────────────────────────
try {
  const list = printer.getPrinters()
  console.log('Доступные принтеры:')
  list.forEach(p => console.log(' -', p.name, p.isDefault ? '(по умолчанию)' : ''))
  if (PRINTER_NAME) console.log('Используется:', PRINTER_NAME)
  else              console.log('Используется: принтер по умолчанию')
} catch (e) {
  console.error('Не удалось получить список принтеров:', e.message)
}

// ─── HTTP сервер ──────────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  // CORS — разрешаем только localhost
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  // GET /status — проверка что сервер жив
  if (req.method === 'GET' && req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, printer: PRINTER_NAME || 'default' }))
    return
  }

  // POST /print — печать
  if (req.method === 'POST' && req.url === '/print') {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => {
      let parsed
      try {
        parsed = JSON.parse(body)
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: false, error: 'Неверный JSON' }))
        return
      }

      // Данные приходят base64-encoded ESC/POS байты
      const buffer = Buffer.from(parsed.data, 'base64')
      console.log(`[print] Получено ${buffer.length} байт, отправляю на принтер...`)

      printer.printDirect({
        data:    buffer,
        printer: PRINTER_NAME || undefined, // undefined = default printer
        type:    'RAW',
        success: (jobId) => {
          console.log(`[print] OK, job id: ${jobId}`)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true, jobId }))
        },
        error: (err) => {
          console.error('[print] Ошибка:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: false, error: String(err) }))
        },
      })
    })
    return
  }

  res.writeHead(404)
  res.end()
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nPrint server запущен: http://127.0.0.1:${PORT}`)
  console.log('Для остановки: Ctrl+C\n')
})
