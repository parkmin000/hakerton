import { useEffect, useRef, useState, useCallback } from 'react'
import './pages.css'

// --- Constants ---
const COLS = 10
const ROWS = 20
const BLOCK_SIZE = 30
const CANVAS_WIDTH = COLS * BLOCK_SIZE
const CANVAS_HEIGHT = ROWS * BLOCK_SIZE

const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]]  // Z
]

// Pastel Colors
const COLORS = [
  '#A2E8FA', // I - Pastel Cyan
  '#FFF4BD', // O - Pastel Yellow
  '#D4C4FB', // T - Pastel Purple
  '#FFD4B2', // L - Pastel Orange
  '#AECBFA', // J - Pastel Blue
  '#B8EDD2', // S - Pastel Green
  '#FFB7B2'  // Z - Pastel Red
]

// --- Styles ---
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f2f3f9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '20px',
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
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    marginBottom: '30px',
  },
  canvas: {
    display: 'block',
    borderRadius: '12px',
    backgroundColor: '#fafafa', // Very light gray for board bg
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
  }, [delay])
}

function JiEun2Game() {
  const canvasRef = useRef(null)
  
  // Game State
  const [board, setBoard] = useState(Array.from({ length: ROWS }, () => Array(COLS).fill(0)))
  const [currentPiece, setCurrentPiece] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // --- Helper Functions ---
  const checkCollision = useCallback((checkBoard, piece, offsetX, offsetY, rotatedShape = null) => {
    const shape = rotatedShape || piece.shape
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
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

  const rotateMatrix = (matrix) => {
    return matrix[0].map((val, index) => matrix.map(row => row[index]).reverse())
  }

  const spawnPiece = useCallback(() => {
    const typeId = Math.floor(Math.random() * SHAPES.length)
    const shape = SHAPES[typeId]
    const color = COLORS[typeId]
    const newPiece = {
      shape,
      color,
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0
    }
    return newPiece
  }, [])

  // --- Actions ---

  const lockPiece = useCallback(() => {
    setBoard(prevBoard => {
      const newBoard = prevBoard.map(row => [...row])
      // Merge
      if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value && currentPiece.y + y >= 0) {
              newBoard[currentPiece.y + y][currentPiece.x + x] = currentPiece.color
            }
          })
        })
      }

      // Clear Lines
      let linesCleared = 0
      for (let y = ROWS - 1; y >= 0; y--) {
        if (newBoard[y].every(cell => cell !== 0)) {
          newBoard.splice(y, 1)
          newBoard.unshift(Array(COLS).fill(0))
          linesCleared++
          y++
        }
      }
      if (linesCleared > 0) setScore(s => s + linesCleared * 100)

      return newBoard
    })
    
    // Spawn new piece logic
    const nextPiece = spawnPiece()
    setCurrentPiece(nextPiece)
  }, [currentPiece, spawnPiece]) 

  const move = useCallback((dir) => {
    if (!currentPiece || gameOver || !isPlaying) return
    
    if (!checkCollision(board, currentPiece, dir, 0)) {
      setCurrentPiece(prev => ({ ...prev, x: prev.x + dir }))
    }
  }, [board, currentPiece, gameOver, isPlaying, checkCollision])

  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || !isPlaying) return
    const rotatedShape = rotateMatrix(currentPiece.shape)
    
    if (!checkCollision(board, currentPiece, 0, 0, rotatedShape)) {
      setCurrentPiece(prev => ({ ...prev, shape: rotatedShape }))
    } else {
        // Wall Kicks
        if (!checkCollision(board, currentPiece, -1, 0, rotatedShape)) {
             setCurrentPiece(prev => ({ ...prev, x: prev.x - 1, shape: rotatedShape }))
        } else if (!checkCollision(board, currentPiece, 1, 0, rotatedShape)) {
             setCurrentPiece(prev => ({ ...prev, x: prev.x + 1, shape: rotatedShape }))
        }
    }
  }, [board, currentPiece, gameOver, isPlaying, checkCollision])

  const drop = useCallback(() => {
    if (!currentPiece || gameOver || !isPlaying) return

    if (!checkCollision(board, currentPiece, 0, 1)) {
      setCurrentPiece(prev => ({ ...prev, y: prev.y + 1 }))
    } else {
      lockPiece()
    }
  }, [board, currentPiece, gameOver, isPlaying, checkCollision, lockPiece])

  // --- Hold Button Logic ---
  const latestDrop = useRef(drop)
  useEffect(() => { latestDrop.current = drop }, [drop])
  
  const dropIntervalRef = useRef(null)

  useEffect(() => {
      return () => {
          if (dropIntervalRef.current) clearInterval(dropIntervalRef.current)
      }
  }, [])

  const handleDropStart = (e) => {
    if (!isPlaying || gameOver) return
    // Prevent default on touch to avoid scrolling/simulated mouse events if needed
    // But allowing default click behavior might be needed if we used onClick, but we aren't.
    if (e.type === 'touchstart' && e.cancelable) {
        e.preventDefault() 
    }

    // Visual feedback
    e.currentTarget.style.backgroundColor = '#e0e0e0'
    e.currentTarget.style.transform = 'scale(0.95)'

    // Immediate action (Tap)
    latestDrop.current()

    // Start interval (Hold)
    if (dropIntervalRef.current) clearInterval(dropIntervalRef.current)
    dropIntervalRef.current = setInterval(() => {
        latestDrop.current()
    }, 100) // 100ms interval
  }

  const handleDropEnd = (e) => {
    if (dropIntervalRef.current) {
        clearInterval(dropIntervalRef.current)
        dropIntervalRef.current = null
    }
    // Restore visual
    e.currentTarget.style.backgroundColor = '#ffffff'
    e.currentTarget.style.transform = 'scale(1)'
  }

  // --- Game Loop ---
  useInterval(() => {
    drop()
  }, isPlaying && !gameOver ? 1000 : null)

  // Check Game Over on Piece Spawn
  useEffect(() => {
      if (currentPiece && isPlaying && !gameOver) {
          if (checkCollision(board, currentPiece, 0, 0)) {
              setGameOver(true)
              setIsPlaying(false)
          }
      }
  }, [currentPiece, board, isPlaying, gameOver, checkCollision])


  // --- Rendering ---
  const drawBlock = (ctx, x, y, color) => {
    const px = x * BLOCK_SIZE
    const py = y * BLOCK_SIZE
    const size = BLOCK_SIZE

    // Base Fill
    ctx.fillStyle = color
    ctx.fillRect(px, py, size, size)

    // Soft 3D Effect (Highlight Top/Left)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fillRect(px, py, size, 4) // Top
    ctx.fillRect(px, py, 4, size) // Left

    // Soft 3D Effect (Shadow Bottom/Right)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(px, py + size - 4, size, 4) // Bottom
    ctx.fillRect(px + size - 4, py, 4, size) // Right
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Clear with Board Background
    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw Grid (Subtle)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)'
    ctx.lineWidth = 1
    for(let i=0; i<=COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i*BLOCK_SIZE, 0); ctx.lineTo(i*BLOCK_SIZE, CANVAS_HEIGHT); ctx.stroke();
    }
    for(let i=0; i<=ROWS; i++) {
        ctx.beginPath(); ctx.moveTo(0, i*BLOCK_SIZE); ctx.lineTo(CANVAS_WIDTH, i*BLOCK_SIZE); ctx.stroke();
    }

    // Draw Board Blocks
    board.forEach((row, y) => {
      row.forEach((color, x) => {
        if (color) {
          drawBlock(ctx, x, y, color)
        }
      })
    })

    // Draw Ghost Piece (Soft Gray)
    if (currentPiece && isPlaying) {
        let ghostY = currentPiece.y
        while (!checkCollision(board, currentPiece, 0, ghostY - currentPiece.y + 1)) {
            ghostY++
        }
        ctx.globalAlpha = 0.3
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    drawBlock(ctx, currentPiece.x + x, ghostY + y, '#A0A0A0')
                }
            })
        })
        ctx.globalAlpha = 1.0
    }

    // Draw Current Piece
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value) {
            drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color)
          }
        })
      })
    }

  }, [board, currentPiece, isPlaying, checkCollision])


  const handleStart = () => {
    setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(0)))
    setScore(0)
    setGameOver(false)
    setIsPlaying(true)
    setCurrentPiece(spawnPiece())
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>시간표테트리스</h1>
        <div style={styles.score}>Score : {score}</div>
      </div>

      <div style={styles.boardContainer}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={styles.canvas}
        />
        
        {/* Overlays */}
        {(gameOver || !isPlaying) && (
          <div style={styles.overlay}>
            <h2 style={styles.overlayTitle}>
              {gameOver ? 'Game Over' : 'Ready?'}
            </h2>
            {gameOver && <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#555' }}>Final Score: {score}</p>}
            
            <button 
              onClick={handleStart} 
              style={styles.startButton}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {gameOver ? 'Try Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <button 
            style={styles.controlBtn} 
            onClick={() => move(-1)} 
            disabled={!isPlaying || gameOver}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            onTouchStart={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onTouchEnd={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
            ←
        </button>
        
        <button 
            style={styles.controlBtn} 
            // Replace onClick with Hold Handlers
            onMouseDown={handleDropStart}
            onMouseUp={handleDropEnd}
            onMouseLeave={handleDropEnd}
            onTouchStart={handleDropStart}
            onTouchEnd={handleDropEnd}
            disabled={!isPlaying || gameOver}
        >
            ↓
        </button>
        
        <button 
            style={styles.controlBtn} 
            onClick={() => move(1)} 
            disabled={!isPlaying || gameOver}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            onTouchStart={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onTouchEnd={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
            →
        </button>

        <button 
            style={styles.controlBtn} 
            onClick={rotate} 
            disabled={!isPlaying || gameOver}
            onMouseDown={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseUp={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            onTouchStart={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onTouchEnd={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
            ↻
        </button>
      </div>
    </div>
  )
}

export default JiEun2Game
