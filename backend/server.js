const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// 개발 편의를 위한 CORS 허용 (프록시 사용 시에는 사실상 영향이 적습니다)
app.use(cors())
app.use(express.json())

// 메모리 상 최고 기록(서버 재시작 시 초기화)
// key: playerId (minyoung/jieun/yeonhee 등)
const bestAttemptsByPlayer = {}
const allowedPlayers = new Set(['minyoung', 'jieun', 'yeonhee'])

function normalizePlayer(player) {
  if (typeof player !== 'string') return null
  const trimmed = player.trim()
  if (!allowedPlayers.has(trimmed)) return null
  return trimmed
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from backend',
    time: new Date().toISOString(),
  })
})

app.get('/api/highscore', (req, res) => {
  const player = normalizePlayer(req.query?.player)
  if (!player) return res.status(400).json({ error: '`player` is required' })

  res.json({ bestAttempts: bestAttemptsByPlayer[player] ?? null })
})

app.post('/api/highscore', (req, res) => {
  const player = normalizePlayer(req.body?.player)
  if (!player) return res.status(400).json({ error: '`player` must be one of minyoung/jieun/yeonhee' })

  const attemptsRaw = req.body?.attempts
  const attempts = typeof attemptsRaw === 'string' ? Number(attemptsRaw) : attemptsRaw

  if (!Number.isInteger(attempts) || attempts <= 0) {
    return res.status(400).json({ error: '`attempts` must be a positive integer' })
  }

  const current = bestAttemptsByPlayer[player] ?? null
  if (current === null || attempts < current) {
    bestAttemptsByPlayer[player] = attempts
  }

  res.json({ bestAttempts: bestAttemptsByPlayer[player] })
})

// 404 처리
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`BE listening on http://localhost:${port}`)
})

