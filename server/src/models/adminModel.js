import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const TOKEN_FILE = path.resolve(process.cwd(), 'server', 'data', 'admin_tokens.json')

function readTokens() {
  try {
    const raw = fs.readFileSync(TOKEN_FILE, 'utf8')
    return JSON.parse(raw || '[]')
  } catch {
    return []
  }
}

function writeTokens(arr) {
  fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true })
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(arr, null, 2))
}

export function createTokenForAdmin(email) {
  const tokens = readTokens()
  const token = uuidv4()
  tokens.push({ token, email, createdAt: new Date().toISOString() })
  writeTokens(tokens)
  return token
}

export function revokeToken(token) {
  let tokens = readTokens()
  tokens = tokens.filter(t => t.token !== token)
  writeTokens(tokens)
}

export function isValidToken(token) {
  if (!token) return false
  const tokens = readTokens()
  return tokens.some(t => t.token === token)
}

export default { createTokenForAdmin, revokeToken, isValidToken }
