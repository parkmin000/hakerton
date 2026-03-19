import { useEffect, useRef, useState } from 'react'
import './pages.css'

// Game Constants
const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600
const BASKET_WIDTH = 100
const BASKET_HEIGHT = 50
const ITEM_WIDTH = 50
const ITEM_HEIGHT = 70
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
      y: this.height - BASKET_HEIGHT - 20,
      width: BASKET_WIDTH,
      height: BASKET_HEIGHT,
      color: '#2E3B84', // Dark Blue
    }

    this.items = []
    this.score = 0
    this.gameActive = false
    this.animationId = null
    this.lastTime = 0
    this.spawnTimer = 0
    this.timeLeft = GAME_DURATION // Initialize to show duration before start

    // Game parameters
    this.spawnInterval = 500 // ms
    this.baseSpeed = 150 // pixels per second

    this.handleInput = this.handleInput.bind(this)
    
    // Attach event listeners
    this.canvas.addEventListener('pointermove', this.handleInput)
    this.canvas.style.touchAction = 'none' 

    // Initial draw
    this.draw()
  }

  start() {
    this.items = []
    this.score = 0
    this.gameActive = true
    this.lastTime = performance.now()
    this.spawnTimer = 0
    this.timeLeft = GAME_DURATION
    this.spawnInterval = 500
    
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
    this.draw() // Draw final state
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
    if (rand < 5) grade = GRADES[0] // A+
    else if (rand < 25) grade = GRADES[1] // A
    else if (rand < 50) grade = GRADES[2] // B
    else if (rand < 60) grade = GRADES[3] // C
    else grade = GRADES[4] // F

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

    // 2. Draw Items (behind UI, but in front of background)
    
    this.items.forEach(item => {
      this.ctx.save()
      
      // Shadow for card
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
      this.ctx.shadowBlur = 10
      this.ctx.shadowOffsetY = 4
      this.ctx.shadowOffsetX = 0

      // Card Background
      this.ctx.fillStyle = 'white'
      this.ctx.fillRect(item.x, item.y, item.width, item.height)
      
      // Remove shadow for text
      this.ctx.shadowColor = 'transparent'
      this.ctx.fillStyle = item.grade.label === 'F' ? '#FF4500' : '#000'
      this.ctx.font = 'bold 24px sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(item.grade.label, item.x + item.width / 2, item.y + item.height / 2)
      
      this.ctx.restore()
    })

    // 3. Draw Basket (Trapezoid with rounded feel)
    this.ctx.fillStyle = this.basket.color
    this.ctx.beginPath()
    this.ctx.moveTo(this.basket.x, this.basket.y)
    this.ctx.lineTo(this.basket.x + this.basket.width, this.basket.y)
    this.ctx.lineTo(this.basket.x + this.basket.width * 0.85, this.basket.y + this.basket.height)
    this.ctx.lineTo(this.basket.x + this.basket.width * 0.15, this.basket.y + this.basket.height)
    this.ctx.closePath()
    this.ctx.fill()
    
    // Add rounded corners using stroke
    this.ctx.lineJoin = 'round'
    this.ctx.lineWidth = 10
    this.ctx.strokeStyle = this.basket.color
    this.ctx.stroke()

    // 4. Draw UI (Top Layer)
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    
    // Title
    this.ctx.font = '900 32px sans-serif'
    this.ctx.fillStyle = '#000'
    this.ctx.fillText('학점받기게임', this.width / 2, 50)
    
    // Score & Time
    this.ctx.font = 'bold 20px sans-serif'
    this.ctx.fillText(`Score : ${this.score}`, this.width * 0.3, 90)
    this.ctx.fillText(`Time : ${Math.ceil(this.timeLeft)}`, this.width * 0.7, 90)
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
    <div className="credit-game-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{ display: 'block', backgroundColor: '#f2f3f9', cursor: 'none' }}
        />
        {!isPlaying && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(255,255,255,0.8)', // Lighter overlay
            backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            flexDirection: 'column', color: '#333'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>
              {timeLeft === 0 ? `Game Over` : 'Ready?'}
            </h2>
             {timeLeft === 0 && <p style={{ fontSize: '20px', marginBottom: '20px' }}>Final Score: <strong>{score}</strong></p>}
            <button 
              onClick={handleStart}
              style={{ 
                padding: '12px 30px', 
                fontSize: '18px', 
                fontWeight: 'bold',
                cursor: 'pointer', 
                backgroundColor: '#2E3B84', 
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
              }}
            >
              {timeLeft === 0 ? 'Play Again' : 'Start'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreditGame
