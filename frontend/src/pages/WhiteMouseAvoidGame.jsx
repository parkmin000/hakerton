import { useEffect, useRef, useState } from 'react'
import './pages.css'
import haruImg from '../assets/haru.png'

const FIELD_W = 560
const FIELD_H = 360
const PLAYER_SIZE = 22
const MOUSE_SIZE = 28
const START_ENEMY_COUNT = 1
const MAX_ENEMY_COUNT = 30
const SPAWN_TICK_INTERVAL = 90
const PLAYER_HIT_RADIUS = 5
const MOUSE_HIT_RADIUS = 6

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function randomEdgePosition() {
  const edge = Math.floor(Math.random() * 4) // 0: top, 1: right, 2: bottom, 3: left
  const margin = MOUSE_SIZE / 2
  const innerMargin = 20

  if (edge === 0) {
    return { x: rand(innerMargin, FIELD_W - innerMargin), y: margin }
  }
  if (edge === 1) {
    return { x: FIELD_W - margin, y: rand(innerMargin, FIELD_H - innerMargin) }
  }
  if (edge === 2) {
    return { x: rand(innerMargin, FIELD_W - innerMargin), y: FIELD_H - margin }
  }
  return { x: margin, y: rand(innerMargin, FIELD_H - innerMargin) }
}

function createEnemy(id) {
  const spawn = randomEdgePosition()
  return {
    id,
    x: spawn.x,
    y: spawn.y,
    vx: rand(-2.6, 2.6) || 1.4,
    vy: rand(-2.2, 2.2) || -1.2,
  }
}

function createEnemies(count) {
  return Array.from({ length: count }).map((_, i) => createEnemy(i))
}

function WhiteMouseAvoidGame() {
  const [running, setRunning] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timeSec, setTimeSec] = useState(0)
  const [bestSec, setBestSec] = useState(0)
  const [player, setPlayer] = useState({ x: FIELD_W / 2, y: FIELD_H / 2 })
  const [enemies, setEnemies] = useState(() => createEnemies(START_ENEMY_COUNT))

  const areaRef = useRef(null)
  const rafRef = useRef(0)
  const tickRef = useRef(0)
  const enemiesRef = useRef(enemies)
  const draggingRef = useRef(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const nextEnemyIdRef = useRef(START_ENEMY_COUNT)

  const resetGame = () => {
    const freshEnemies = createEnemies(START_ENEMY_COUNT)
    setPlayer({ x: FIELD_W / 2, y: FIELD_H / 2 })
    setEnemies(freshEnemies)
    enemiesRef.current = freshEnemies
    nextEnemyIdRef.current = START_ENEMY_COUNT
    setTimeSec(0)
    setGameOver(false)
    tickRef.current = 0
    setRunning(true)
  }

  useEffect(() => {
    enemiesRef.current = enemies
  }, [enemies])

  useEffect(() => {
    const pointerToField = (e) => {
      if (!areaRef.current) return null
      const rect = areaRef.current.getBoundingClientRect()
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        return null
      }
      const x = ((e.clientX - rect.left) / rect.width) * FIELD_W
      const y = ((e.clientY - rect.top) / rect.height) * FIELD_H
      return { x, y }
    }

    const movePlayerToPointer = (e) => {
      if (!running || gameOver || !areaRef.current) return
      const point = pointerToField(e)
      if (!point) return
      const x = clamp(point.x + dragOffsetRef.current.x, PLAYER_SIZE / 2, FIELD_W - PLAYER_SIZE / 2)
      const y = clamp(point.y + dragOffsetRef.current.y, PLAYER_SIZE / 2, FIELD_H - PLAYER_SIZE / 2)
      setPlayer({ x, y })
    }

    const onPointerDown = (e) => {
      if (!running || gameOver) return
      const point = pointerToField(e)
      if (!point) return
      dragOffsetRef.current = {
        x: player.x - point.x,
        y: player.y - point.y,
      }
      draggingRef.current = true
      movePlayerToPointer(e)
    }

    const onPointerMove = (e) => {
      if (!draggingRef.current) return
      movePlayerToPointer(e)
    }

    const onPointerUp = () => {
      draggingRef.current = false
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [running, gameOver, player.x, player.y])

  useEffect(() => {
    if (!running || gameOver) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    const loop = () => {
      tickRef.current += 1
      if (tickRef.current % 6 === 0) {
        setTimeSec((prev) => {
          const next = prev + 0.1
          setBestSec((best) => Math.max(best, next))
          return next
        })
      }

      let collided = false
      let nextEnemies = enemiesRef.current.map((m) => {
        let nextX = m.x + m.vx
        let nextY = m.y + m.vy
        let nextVx = m.vx
        let nextVy = m.vy

        if (nextX < MOUSE_SIZE / 2 || nextX > FIELD_W - MOUSE_SIZE / 2) {
          nextVx *= -1
          nextX = clamp(nextX, MOUSE_SIZE / 2, FIELD_W - MOUSE_SIZE / 2)
        }
        if (nextY < MOUSE_SIZE / 2 || nextY > FIELD_H - MOUSE_SIZE / 2) {
          nextVy *= -1
          nextY = clamp(nextY, MOUSE_SIZE / 2, FIELD_H - MOUSE_SIZE / 2)
        }

        const dx = player.x - nextX
        const dy = player.y - nextY
        const distance = Math.hypot(dx, dy)
        if (distance <= PLAYER_HIT_RADIUS + MOUSE_HIT_RADIUS) {
          console.log('닿음')
          collided = true
        }

        return { ...m, x: nextX, y: nextY, vx: nextVx, vy: nextVy }
      })

      if (
        tickRef.current % SPAWN_TICK_INTERVAL === 0 &&
        nextEnemies.length < MAX_ENEMY_COUNT
      ) {
        nextEnemies = [...nextEnemies, createEnemy(nextEnemyIdRef.current)]
        nextEnemyIdRef.current += 1
      }

      enemiesRef.current = nextEnemies
      setEnemies(nextEnemies)

      if (collided) {
        cancelAnimationFrame(rafRef.current)
        setRunning(false)
        setGameOver(true)
        return
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [running, gameOver, player, timeSec])

  return (
    <section id="center">
      <div className="mouse-avoid-wrap">
        <p className="mouse-avoid-sub">커서를 움직여 파란 점을 조종하고 마루를 피하세요.</p>

        <div className="mouse-avoid-meta">
          <span>
            최고 기록: <code>{bestSec.toFixed(1)}초</code>
          </span>
        </div>

        <div ref={areaRef} className="mouse-avoid-field">
          <div
            className="mouse-player"
            style={{
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              left: `${(player.x / FIELD_W) * 100}%`,
              top: `${(player.y / FIELD_H) * 100}%`,
            }}
          />

          {enemies.map((m) => (
            <div
              key={m.id}
              className="white-mouse"
              style={{
                width: MOUSE_SIZE,
                height: MOUSE_SIZE,
                left: `${(m.x / FIELD_W) * 100}%`,
                top: `${(m.y / FIELD_H) * 100}%`,
              }}
            >
              <img src={haruImg} alt="" className="white-mouse-img" draggable={false} />
            </div>
          ))}

          {!running && !gameOver ? (
            <div className="mouse-overlay">
              <button className="counter" type="button" onClick={resetGame}>
                시작하기
              </button>
            </div>
          ) : null}

          {gameOver ? (
            <div className="mouse-overlay">
              <p>하얀쥐에게 닿아서 게임 끝!</p>
              <button className="counter" type="button" onClick={resetGame}>
                다시 하기
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default WhiteMouseAvoidGame

