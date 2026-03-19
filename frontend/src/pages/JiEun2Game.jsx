import { useEffect, useRef, useState, useCallback } from 'react'
import './pages.css'

const COLS = 10
const ROWS = 20
const BLOCK_SIZE = 20
const CANVAS_WIDTH = COLS * BLOCK_SIZE
const CANVAS_HEIGHT = ROWS * BLOCK_SIZE

const SHAPES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
]

const COLORS = ['#A2E8FA', '#FFF4BD', '#D4C4FB', '#FFD4B2', '#AECBFA', '#B8EDD2', '#FFB7B2']

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '8px 0 0',
    width: '100%',
    flex: 1,
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  score: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#555',
  },
  boardContainer: {
    position: 'relative',
    padding: '0',
    backgroundColor: 'transparent',
    borderRadius: '20px',
    boxShadow: 'none',
    marginBottom: '18px',
    width: '100%',
  },
  canvas: {
    display: 'block',
    width: '100%',
    height: 'auto',
    borderRadius: '12px',
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(4px)',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  overlayTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '10px',
  },
  startButton: {
    padding: '14px 32px',
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#1a1a1a',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    transition: 'transform 0.1s ease',
  },
  controls: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  controlBtn: {
    flex: 1,
    height: '64px',
    borderRadius: '16px',
    border: 'none',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    color: '#333',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s, transform 0.1s',
    outline: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
  },
}

function useInterval(callback, delay) {
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
    return undefined
  }, [delay])
}

function JiEun2Game() {
  const canvasRef = useRef(null)

  const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)))
  const [currentPiece, setCurrentPiece] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const checkCollision = useCallback((checkBoard, piece, offsetX, offsetY, rotatedShape = null) => {
    const shape = rotatedShape || piece.shape
    for (let y = 0; y < shape.length; y += 1) {
      for (let x = 0; x < shape[y].length; x += 1) {
        if (shape[y][x]) {
          const newX = piece.x + x + offsetX
          const newY = piece.y + y + offsetY
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true
          if (newY >= 0 && checkBoard[newY][newX]) return true
        }
      }
    }
    return false
  }, [])

  const rotateMatrix = (matrix) => matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse())

  const spawnPiece = useCallback(() => {
    const typeId = Math.floor(Math.random() * SHAPES.length)
    const shape = SHAPES[typeId]
    const color = COLORS[typeId]
    return {
      shape,
      color,
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0,
    }
  }, [])

  const lockPiece = useCallback(() => {
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row])
      if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value && currentPiece.y + y >= 0) {
              newBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color
            }
          })
        })
      }

      let linesCleared = 0
      for (let y = ROWS - 1; y >= 0; y -= 1) {
        if (newBoard[y].every((cell) => cell !== 0)) {
          newBoard.splice(y, 1)
          newBoard.unshift(Array(COLS).fill(0))
          linesCleared += 1
          y += 1
        }
      }
      if (linesCleared > 0) setScore((s) => s + linesCleared * 100)
      return newBoard
    })

    setCurrentPiece(spawnPiece())
  }, [currentPiece, spawnPiece])

  const move = useCallback(
    (dir) => {
      if (!currentPiece || gameOver || !isPlaying) return
      if (!checkCollision(board, currentPiece, dir, 0)) {
        setCurrentPiece((prev) => ({ ...prev, x: prev.x + dir }))
      }
    },
    [board, currentPiece, gameOver, isPlaying, checkCollision],
  )

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || !isPlaying) return
    const rotatedShape = rotateMatrix(currentPiece.shape)
    if (!checkCollision(board, currentPiece, 0, 0, rotatedShape)) {
      setCurrentPiece((prev) => ({ ...prev, shape: rotatedShape }))
    }
  }, [board, currentPiece, gameOver, isPlaying, checkCollision])

  const drop = useCallback(() => {
    if (!currentPiece || gameOver || !isPlaying) return
    if (!checkCollision(board, currentPiece, 0, 1)) {
      setCurrentPiece((prev) => ({ ...prev, y: prev.y + 1 }))
    } else {
      lockPiece()
    }
  }, [board, currentPiece, gameOver, isPlaying, checkCollision, lockPiece])

  useInterval(() => {
    drop()
  }, isPlaying && !gameOver ? 1000 : null)

  useEffect(() => {
    if (currentPiece && isPlaying && !gameOver && checkCollision(board, currentPiece, 0, 0)) {
      setGameOver(true)
      setIsPlaying(false)
    }
  }, [currentPiece, board, isPlaying, gameOver, checkCollision])

  const drawBlock = (ctx, x, y, color) => {
    const px = x * BLOCK_SIZE
    const py = y * BLOCK_SIZE
    ctx.fillStyle = color
    ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fillRect(px, py, BLOCK_SIZE, 4)
    ctx.fillRect(px, py, 4, BLOCK_SIZE)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(px, py + BLOCK_SIZE - 4, BLOCK_SIZE, 4)
    ctx.fillRect(px + BLOCK_SIZE - 4, py, 4, BLOCK_SIZE)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i <= COLS; i += 1) {
      ctx.beginPath()
      ctx.moveTo(i * BLOCK_SIZE, 0)
      ctx.lineTo(i * BLOCK_SIZE, CANVAS_HEIGHT)
      ctx.stroke()
    }
    for (let i = 0; i <= ROWS; i += 1) {
      ctx.beginPath()
      ctx.moveTo(0, i * BLOCK_SIZE)
      ctx.lineTo(CANVAS_WIDTH, i * BLOCK_SIZE)
      ctx.stroke()
    }

    board.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) drawBlock(ctx, x, y, color)
      })
    })

    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color)
        })
      })
    }
  }, [board, currentPiece])

  const handleStart = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)))
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
    setCurrentPiece(spawnPiece())
  }

  return (
    <section id="center">
      <div className="beer-game-shell">
        <div
          className="beer-game-board"
          style={{ background: 'transparent', backdropFilter: 'none', WebkitBackdropFilter: 'none', minHeight: 'auto', paddingBottom: '12px' }}
        >
          <div style={styles.container}>
            <div style={styles.header}>
              <h1 style={styles.title}>시간표테트리스</h1>
              <div style={styles.score}>Score : {score}</div>
            </div>

            <div style={styles.boardContainer}>
              <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={styles.canvas} />

              {(gameOver || !isPlaying) && (
                <div style={styles.overlay}>
                  <h2 style={styles.overlayTitle}>{gameOver ? 'Game Over' : 'Ready?'}</h2>
                  <button
                    onClick={handleStart}
                    style={styles.startButton}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)'
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {gameOver ? 'Try Again' : 'Start Game'}
                  </button>
                </div>
              )}
            </div>

            <div style={styles.controls}>
              <button style={styles.controlBtn} onClick={() => move(-1)} disabled={!isPlaying || gameOver}>
                ←
              </button>
              <button style={styles.controlBtn} onClick={drop} disabled={!isPlaying || gameOver}>
                ↓
              </button>
              <button style={styles.controlBtn} onClick={() => move(1)} disabled={!isPlaying || gameOver}>
                →
              </button>
              <button style={styles.controlBtn} onClick={rotate} disabled={!isPlaying || gameOver}>
                ↻
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default JiEun2Game

