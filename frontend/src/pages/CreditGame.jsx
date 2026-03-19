import { useEffect, useRef, useState } from 'react'
import './pages.css'

// Game Constants
const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600
const BASKET_WIDTH = 80
const BASKET_HEIGHT = 40
const ITEM_WIDTH = 40
const ITEM_HEIGHT = 60
const GAME_DURATION = 30 // seconds

const GRADES = [
  { label: 'A+', score: 100, color: '#FFD700' }, // Gold
  { label: 'A', score: 80, color: '#C0C0C0' }, // Silver
  { label: 'B', score: 60, color: '#CD7F32' }, // Bronze
  { label: 'C', score: 40, color: '#87CEEB' }, // Sky Blue
  { label: 'F', score: -40, color: '#FF4500' }, // Red-Orange
]

class CreditGameLogic {
  constructor(canvas, onScoreChange, onTimeUpdate, onGameOver) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
    this.onScoreChange = onScoreChange
    this.onTimeUpdate = onTimeUpdate
    this.onGameOver = onGameOver

    this.basket = {
      x: this.width / 2 - BASKET_WIDTH / 2,
      y: this.height - BASKET_HEIGHT - 10,
      width: BASKET_WIDTH,
      height: BASKET_HEIGHT,
      color: '#8B4513', // SaddleBrown
    }

    this.items = []
    this.score = 0
    this.gameActive = false
    this.animationId = null
    this.lastTime = 0
    this.spawnTimer = 0
    this.timeLeft = 0

    // Game parameters
    this.spawnInterval = 500 // ms (0.5s) - Doubled spawn rate
    this.baseSpeed = 150 // pixels per second

    this.handleInput = this.handleInput.bind(this)
    
    // Attach event listeners
    this.canvas.addEventListener('pointermove', this.handleInput)
    // Prevent default touch actions to avoid scrolling
    this.canvas.style.touchAction = 'none' 
  }

  start() {
    this.items = []
    this.score = 0
    this.gameActive = true
    this.lastTime = performance.now()
    this.spawnTimer = 0
    this.timeLeft = GAME_DURATION
    this.spawnInterval = 500 // Ensure it's 500ms on restart
    
    this.onScoreChange(this.score)
    this.onTimeUpdate(this.timeLeft)
    this.loop(this.lastTime)
  }

  stop() {
    this.gameActive = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.onGameOver()
  }

  destroy() {
    this.stop()
    this.canvas.removeEventListener('pointermove', this.handleInput)
  }

  handleInput(e) {
    if (!this.gameActive) return
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    
    let clientX = e.clientX
    
    let x = (clientX - rect.left) * scaleX
    
    // Center the basket on the pointer
    this.basket.x = x - this.basket.width / 2

    // Clamp to screen bounds
    if (this.basket.x < 0) this.basket.x = 0
    if (this.basket.x + this.basket.width > this.width) {
      this.basket.x = this.width - this.basket.width
    }
  }

  spawnItem() {
    // Weighted Random Selection
    // A+: 5%, A: 20%, B: 25%, C: 10%, F: 40%
    const rand = Math.random() * 100
    let grade
    if (rand < 5) {
      grade = GRADES[0] // A+ (0-5)
    } else if (rand < 25) {
      grade = GRADES[1] // A (5-25: 20%)
    } else if (rand < 50) {
      grade = GRADES[2] // B (25-50: 25%)
    } else if (rand < 60) {
      grade = GRADES[3] // C (50-60: 10%)
    } else {
      grade = GRADES[4] // F (60-100: 40%)
    }

    const x = Math.random() * (this.width - ITEM_WIDTH)
    
    this.items.push({
      x,
      y: -ITEM_HEIGHT,
      width: ITEM_WIDTH,
      height: ITEM_HEIGHT,
      grade: grade,
      speed: this.baseSpeed * (0.9 + Math.random() * 0.2) 
    })
  }

  update(deltaTime) {
    const dt = deltaTime / 1000 // convert to seconds

    // Timer Logic
    this.timeLeft -= dt
    if (this.timeLeft <= 0) {
      this.timeLeft = 0
      this.onTimeUpdate(0)
      this.stop()
      return
    }
    this.onTimeUpdate(Math.ceil(this.timeLeft))

    // Spawn Items
    this.spawnTimer += deltaTime
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnTimer = 0
      this.spawnItem()
    }

    // Update Items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]
      item.y += item.speed * dt

      // Collision with Basket
      if (
        item.x < this.basket.x + this.basket.width &&
        item.x + item.width > this.basket.x &&
        item.y < this.basket.y + this.basket.height &&
        item.y + item.height > this.basket.y
      ) {
        // Caught
        this.score += item.grade.score
        this.onScoreChange(this.score)
        this.items.splice(i, 1)
        continue
      }

      // Missed (Hit floor)
      if (item.y > this.height) {
        this.items.splice(i, 1)
        continue
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height)

    // Draw Basket
    this.ctx.fillStyle = this.basket.color
    this.ctx.fillRect(this.basket.x, this.basket.y, this.basket.width, this.basket.height)
    
    // Draw Basket Detail
    this.ctx.strokeStyle = '#5D2906'
    this.ctx.lineWidth = 2
    this.ctx.strokeRect(this.basket.x, this.basket.y, this.basket.width, this.basket.height)

    // Draw Items
    this.items.forEach(item => {
      // Paper background
      this.ctx.fillStyle = 'white'
      this.ctx.fillRect(item.x, item.y, item.width, item.height)
      this.ctx.strokeStyle = '#ccc'
      this.ctx.lineWidth = 1
      this.ctx.strokeRect(item.x, item.y, item.width, item.height)

      // Grade Text
      this.ctx.fillStyle = item.grade.label === 'F' ? 'red' : 'black'
      this.ctx.font = 'bold 20px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(item.grade.label, item.x + item.width / 2, item.y + item.height / 2)
    })
  }

  loop(timestamp) {
    if (!this.gameActive) return

    const deltaTime = timestamp - this.lastTime
    this.lastTime = timestamp

    this.update(deltaTime)
    this.draw()

    this.animationId = requestAnimationFrame((t) => this.loop(t))
  }
}

function CreditGame() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (canvasRef.current && !gameRef.current) {
      gameRef.current = new CreditGameLogic(
        canvasRef.current,
        (newScore) => setScore(newScore),
        (newTime) => setTimeLeft(newTime),
        () => setIsPlaying(false)
      )
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy()
        gameRef.current = null
      }
    }
  }, [])

  const handleStart = () => {
    if (gameRef.current) {
      gameRef.current.start()
      setIsPlaying(true)
    }
  }

  return (
    <div className="credit-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px' }}>
      <h1>학점 받기 미니게임</h1>
      <div className="game-info" style={{ display: 'flex', gap: '40px', fontSize: '1.2em' }}>
        <h2>Score: {score}</h2>
        <h2>Time: {timeLeft}s</h2>
      </div>
      <p>바구니를 움직여 학점을 받으세요! (F는 피하세요!)</p>
      
      <div style={{ position: 'relative', border: '2px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ display: 'block', backgroundColor: '#f0f8ff', cursor: 'none' }}
        />
        {!isPlaying && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            flexDirection: 'column', color: 'white'
          }}>
            <h2>{timeLeft === 0 ? `Time's Up! Score: ${score}` : 'Ready?'}</h2>
            <button 
              onClick={handleStart}
              style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer', marginTop: '10px' }}
            >
              {timeLeft === 0 ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreditGame
