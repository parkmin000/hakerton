import { useState, useEffect, useRef } from 'react'
import './pages.css'

import catHead from '../assets/miru.png'
import rabbitHead from '../assets/badharu.png'
import boardImg from '../assets/back.png'
import dudumainImg from '../assets/dudumain.png'
import buttonImg from '../assets/button.png'

const startBg = dudumainImg
const startBtnBg = buttonImg

const createEmptyMoles = () =>
  Array(9)
    .fill(null)
    .map(() => ({ active: false, type: 'cat' }))

const holes = [
  { left: 25, top: 28 },
  { left: 50, top: 28 },
  { left: 75, top: 28 },

  { left: 25, top: 44 },
  { left: 50, top: 44 },
  { left: 75, top: 44 },

  { left: 25, top: 60 },
  { left: 50, top: 60 },
  { left: 75, top: 60 },
]

export default function MoleGame() {
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('moleHighScore') || '0', 10)
  })
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [moles, setMoles] = useState(createEmptyMoles())
  const [hammer, setHammer] = useState({ visible: false, x: 0, y: 0 })

  const timerRef = useRef(null)
  const spawnRef = useRef(null)
  const hammerTimeoutRef = useRef(null)

  const startGame = () => {
    if (isPlaying) return
    setScore(0)
    setTimeLeft(30)
    setIsPlaying(true)
    setMoles(createEmptyMoles())
  }

  const finishGame = (finalScore) => {
    clearInterval(timerRef.current)
    clearInterval(spawnRef.current)
    setIsPlaying(false)
    setMoles(createEmptyMoles())

    setHighScore((prevHigh) => {
      const nextHigh = Math.max(prevHigh, finalScore)
      localStorage.setItem('moleHighScore', String(nextHigh))
      return nextHigh
    })

    alert(`게임 종료! 최종 점수: ${finalScore}점`)
  }

  const endGame = () => {
    finishGame(score)
  }

  useEffect(() => {
    if (!isPlaying) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame(score)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [isPlaying, score])

  useEffect(() => {
    if (!isPlaying) return

    const spawn = () => {
      const randomIndex = Math.floor(Math.random() * 9)
      const type = Math.random() > 0.2 ? 'cat' : 'rabbit'

      setMoles((prev) => {
        if (prev[randomIndex].active) return prev
        const next = [...prev]
        next[randomIndex] = { active: true, type }
        return next
      })

      setTimeout(() => {
        setMoles((prev) => {
          const next = [...prev]
          next[randomIndex] = { ...next[randomIndex], active: false }
          return next
        })
      }, 850)
    }

    spawnRef.current = setInterval(spawn, 700)

    return () => clearInterval(spawnRef.current)
  }, [isPlaying])

  const showHammer = (event) => {
    const point =
      event.touches && event.touches.length > 0 ? event.touches[0] : event

    const rect = event.currentTarget.getBoundingClientRect()
    const x = point.clientX - rect.left
    const y = point.clientY - rect.top

    setHammer({ visible: true, x, y })

    if (hammerTimeoutRef.current) clearTimeout(hammerTimeoutRef.current)
    hammerTimeoutRef.current = setTimeout(() => {
      setHammer((prev) => ({ ...prev, visible: false }))
    }, 180)
  }

  const whack = (index, event) => {
    showHammer(event)

    if (!isPlaying || !moles[index].active) return

    const type = moles[index].type

    if (type === 'cat') {
      setScore((prev) => prev + 10)
    } else {
      setScore((prev) => prev - 30)
    }

    setMoles((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], active: false }
      return next
    })
  }

  return (
    <section id="center">
      <div className="mole-game-shell">
        <div
          className="mole-game-board"
          onMouseDown={!isPlaying ? undefined : showHammer}
          onTouchStart={!isPlaying ? undefined : showHammer}
        >
          {!isPlaying ? (
            <div
              className="start-page"
              style={{ backgroundImage: `url(${startBg})` }}
            >
              <div className="start-overlay">
                <button className="game-start-btn" onClick={startGame}>
                  <img src={startBtnBg} alt="게임 시작" />
                </button>
                <div className="high-score-tag">Best: {highScore}</div>
              </div>
            </div>
          ) : (
            <div className="play-scene">
              <div className="mole-hud">
                <div className="hud-item score">
                  SCORE: <span>{score}</span>
                </div>
                <div className="hud-item timer">
                  TIME: <span>{timeLeft}s</span>
                </div>
              </div>

              <div className="mole-board-wrapper">
                <img src={boardImg} alt="board" className="board-base-img" />

                {holes.map((hole, i) => {
                  const mole = moles[i]

                  return (
                    <button
                      key={i}
                      className="hole-slot"
                      style={{
                        left: `${hole.left}%`,
                        top: `${hole.top}%`,
                      }}
                      onMouseDown={(e) => whack(i, e)}
                      onTouchStart={(e) => whack(i, e)}
                    >
                      <div className="hole-clip">
                        <div
                          className={`char-container ${mole.active ? 'up' : ''}`}
                        >
                          <img
                            src={mole.type === 'cat' ? catHead : rabbitHead}
                            alt={mole.type}
                            className={`char-img ${mole.type}`}
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="play-footer">
                <button className="mole-end-btn" onClick={endGame}>
                  QUIT
                </button>
              </div>
            </div>
          )}

          {hammer.visible && (
            <div
              className="hammer-effect"
              style={{ left: hammer.x, top: hammer.y }}
            >
              🔨
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
