const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// 개발 편의를 위한 CORS 허용 (프록시 사용 시에는 사실상 영향이 적습니다)
app.use(cors())
app.use(express.json())

// 메모리 상 최고 기록(서버 재시작 시 초기화)
let bestAttempts = null

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
  res.json({ bestAttempts })
})

app.post('/api/highscore', (req, res) => {
  const attemptsRaw = req.body?.attempts
  const attempts = typeof attemptsRaw === 'string' ? Number(attemptsRaw) : attemptsRaw

  if (!Number.isInteger(attempts) || attempts <= 0) {
    return res.status(400).json({ error: '`attempts` must be a positive integer' })
  }

  if (bestAttempts === null || attempts < bestAttempts) {
    bestAttempts = attempts
  }

  res.json({ bestAttempts })
})

// 404 처리
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`BE listening on http://localhost:${port}`)
})

