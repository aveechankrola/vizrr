import fs from 'fs'
import path from 'path'

const LOG_DIR = path.resolve(process.cwd(), 'server', 'logs')
const LOG_FILE = path.join(LOG_DIR, 'ai_logs.json')

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true })
  if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, JSON.stringify([]))
}

export function appendLog(entry) {
  try {
    ensureLogDir()
    const raw = fs.readFileSync(LOG_FILE, 'utf8')
    const arr = JSON.parse(raw || '[]')
    arr.push({ ...entry, timestamp: new Date().toISOString() })
    fs.writeFileSync(LOG_FILE, JSON.stringify(arr, null, 2))
  } catch (err) {
    console.error('Failed to append AI log', err)
  }
}

export default { appendLog }
