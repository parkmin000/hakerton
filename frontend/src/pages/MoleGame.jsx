import { useState, useEffect, useRef } from 'react'
import './pages.css'

export default function MoleGame() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isPlaying, setIsPlaying] = useState(false)
  const [moles, setMoles] = useState(Array(9).fill(false))
  const timerRef = useRef(null)
  const moleTimerRef = useRef(null)

  const startGame = () => {
    if (isPlaying) return
    setScore(0)
    setTimeLeft(30)
    setIsPlaying(true)
    setMoles(Array(9).fill(false))
  }

  const endGame = () => {
    setIsPlaying(false)
    clearInterval(timerRef.current)
    clearInterval(moleTimerRef.current)
    setMoles(Array(9).fill(false))
    alert(`게임 종료! 최종 점수: ${score}점`)
  }

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      moleTimerRef.current = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 9)
        setMoles((prev) => {
          const newMoles = [...prev]
          // 이미 두더지가 있는 곳이면 무시하거나 다른 곳을 찾을 수도 있음
          // 간단하게 덮어쓰기
          newMoles[randomIndex] = true
          
          // 0.7초 후에 사라지게 함
          setTimeout(() => {
            setMoles((current) => {
              if (!current[randomIndex]) return current // 이미 잡혔으면 무시
              const newer = [...current]
              newer[randomIndex] = false
              return newer
            })
          }, 700)
          
          return newMoles
        })
      }, 600 + Math.random() * 500) // 0.6~1.1초 간격으로 등장
    }

    return () => {
      clearInterval(timerRef.current)
      clearInterval(moleTimerRef.current)
    }
  }, [isPlaying])

  const whack = (index) => {
    if (!isPlaying || !moles[index]) return
    
    // 점수 획득 및 두더지 사라짐
    setScore((prev) => prev + 10)
    setMoles((prev) => {
      const newMoles = [...prev]
      newMoles[index] = false
      return newMoles
    })
  }

  return (
    <div className="mole-game-container">
      <h1>🐹 두더지 잡기 🐹</h1>
      
      <div className="game-info">
        <div className="score-board">점수: <span>{score}</span></div>
        <div className="timer">시간: <span>{timeLeft}</span>초</div>
      </div>
      
      {!isPlaying && (
        <div className="start-screen">
          <p>{timeLeft === 0 ? '게임 오버!' : '준비되셨나요?'}</p>
          <button className="start-btn" onClick={startGame}>
            {timeLeft === 0 ? '다시 시작' : '게임 시작'}
          </button>
        </div>
      )}

      <div className={`grid ${!isPlaying ? 'disabled' : ''}`}>
        {moles.map((isMole, index) => (
          <div 
            key={index} 
            className={`hole ${isMole ? 'active' : ''}`}
            onMouseDown={() => whack(index)}
          >
            {isMole && <span className="mole">🐹</span>}
            <div className="dirt"></div>
          </div>
        ))}
      </div>
      
      <div className="instructions">
        <p>두더지가 나오면 클릭하세요! (+10점)</p>
      </div>
    </div>
  )
}
