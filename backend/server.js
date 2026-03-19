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
// 블록 쌓기 게임 최고 점수 (높을수록 좋음)
const stackGameScores = {}
const allowedPlayers = new Set(['minyoung', 'jieun', 'yeonhee'])

function normalizePlayer(player) {
  if (typeof player !== 'string') return null
  const trimmed = player.trim()
  // Guest ID 허용 (Guest_로 시작하거나, 기존 허용 목록에 있는 경우)
  if (trimmed.startsWith('Guest_') || allowedPlayers.has(trimmed)) {
    return trimmed
  }
  return null
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

// --- 블록 쌓기 게임 API ---

app.get('/api/stack/score', (req, res) => {
  const player = normalizePlayer(req.query?.player)
  if (!player) return res.status(400).json({ error: '`player` is required' })

  const data = stackGameScores[player]
  if (!data) return res.json({ score: 0, maxCombo: 0, perfectCount: 0 })
  
  if (typeof data === 'number') {
    return res.json({ score: data, maxCombo: 0, perfectCount: 0 })
  }

  res.json(data)
})

app.post('/api/stack/score', (req, res) => {
  const player = normalizePlayer(req.body?.player)
  if (!player) return res.status(400).json({ error: '`player` must be one of minyoung/jieun/yeonhee' })

  const scoreRaw = req.body?.score
  const score = typeof scoreRaw === 'string' ? Number(scoreRaw) : scoreRaw
  const maxCombo = Number(req.body?.maxCombo) || 0
  const perfectCount = Number(req.body?.perfectCount) || 0

  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: '`score` must be a non-negative integer' })
  }

  const currentData = stackGameScores[player] || { score: 0, maxCombo: 0, perfectCount: 0 }
  
  // 점수가 더 높으면 갱신 (또는 점수가 같아도 콤보가 더 높으면 갱신하는 식의 정책도 가능하지만, 보통 점수 우선)
  if (score > currentData.score) {
    stackGameScores[player] = { score, maxCombo, perfectCount }
  }

  res.json({ result: stackGameScores[player] })
})

app.get('/api/stack/rank', (req, res) => {
  // 점수가 높은 순으로 정렬
  const ranking = Object.entries(stackGameScores)
    .map(([player, data]) => {
      // 구버전 데이터(숫자만 있는 경우) 호환성 처리
      if (typeof data === 'number') {
        return { player, score: data, maxCombo: 0, perfectCount: 0 }
      }
      return { player, ...data }
    })
    .sort((a, b) => b.score - a.score)
  
  res.json(ranking)
})

// 404 처리
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`BE listening on http://localhost:${port}`)
})

