import { useEffect, useMemo, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const generateTarget = useMemo(() => {
    return () => Math.floor(Math.random() * 100) + 1 // 1~100
  }, [])

  const [target, setTarget] = useState(() => generateTarget())
  const [guessText, setGuessText] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState('playing') // 'playing' | 'won'
  const [message, setMessage] = useState('숫자를 입력하고 맞춰보세요!')

  const [bestAttempts, setBestAttempts] = useState(null)
  const [highscoreLoading, setHighscoreLoading] = useState(false)
  const [highscoreError, setHighscoreError] = useState(null)

  function newGame() {
    setTarget(generateTarget())
    setGuessText('')
    setAttempts(0)
    setStatus('playing')
    setMessage('숫자를 입력하고 맞춰보세요!')
  }

  async function loadHighscore() {
    setHighscoreLoading(true)
    setHighscoreError(null)
    try {
      const res = await fetch('/api/highscore')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setBestAttempts(data.bestAttempts ?? null)
    } catch (e) {
      setHighscoreError(e instanceof Error ? e.message : String(e))
    } finally {
      setHighscoreLoading(false)
    }
  }

  async function submitHighscoreIfNeeded(wonAttempts) {
    try {
      const res = await fetch('/api/highscore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempts: wonAttempts }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setBestAttempts(data.bestAttempts ?? null)
    } catch {
      // 게임 동작에는 영향 없게 무시
    }
  }

  useEffect(() => {
    loadHighscore()
  }, [])

  async function onSubmitGuess(e) {
    e.preventDefault()
    if (status !== 'playing') return

    const guess = Number(guessText)
    if (!Number.isFinite(guess) || !Number.isInteger(guess)) {
      setMessage('정수를 입력해 주세요. (예: 42)')
      return
    }
    if (guess < 1 || guess > 100) {
      setMessage('1~100 사이 숫자를 입력해 주세요.')
      return
    }

    const nextAttempts = attempts + 1
    setAttempts(nextAttempts)

    if (guess < target) {
      setMessage(`${guess}보다 더 큰 숫자입니다.`)
      return
    }
    if (guess > target) {
      setMessage(`${guess}보다 더 작은 숫자입니다.`)
      return
    }

    setStatus('won')
    setMessage(`정답! ${nextAttempts}번 만에 맞췄어요.`)
    await submitHighscoreIfNeeded(nextAttempts)
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>숫자 맞추기 게임</h1>
          <p>1~100 사이 숫자를 맞혀보세요.</p>

          <div className="game-meta">
            <div>
              시도 횟수: <code>{attempts}</code>
            </div>
            <div>
              최고 기록: <code>{bestAttempts ? `${bestAttempts}번` : '없음'}</code>
            </div>
          </div>

          <form className="game-form" onSubmit={onSubmitGuess}>
            <input
              className="game-input"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="예: 42"
              value={guessText}
              onChange={(e) => setGuessText(e.target.value)}
              disabled={status !== 'playing'}
            />
            <button className="counter" type="submit" disabled={status !== 'playing'}>
              맞추기
            </button>
          </form>

          <p className="game-message">
            결과: <code>{message}</code>
          </p>

          {highscoreError ? (
            <p className="game-error">
              최고 기록 불러오기 실패: <code>{highscoreError}</code>
            </p>
          ) : null}

          <div className="game-actions">
            <button className="counter" type="button" onClick={newGame} disabled={highscoreLoading}>
              새 게임
            </button>
            <button className="counter" type="button" onClick={loadHighscore} disabled={highscoreLoading}>
              {highscoreLoading ? '기록 로딩 중...' : '기록 새로고침'}
            </button>
          </div>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
