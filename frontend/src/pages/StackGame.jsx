import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera, Text, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import './pages.css'

// --- Constants123 ---
const BOX_HEIGHT = 0.7
const INITIAL_SIZE = 5
const BASE_SPEED = 0.15
const SPEED_INCREMENT = 0.005
// 카메라가 블록보다 얼마나 더 위를 바라볼지 (값이 클수록 블록은 화면 아래로 내려감)
const CAMERA_LOOK_OFFSET = 1.5 
// 카메라의 실제 Y 위치 오프셋 (각도 결정)
const CAMERA_POS_Y_OFFSET = 12 

const COLORS = ['#FF4D4D', '#17C3B2', '#FFCB2B', '#A2DE96', '#3DCCDD']

// --- Components ---

// 고정된 블록
const StaticBlock = ({ position, size, color, isBase }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color="black" linewidth={1} transparent opacity={0.2} />
      </lineSegments>
      {isBase && (
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[size[0] + 0.2, 0.2, size[2] + 0.2]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      )}
    </mesh>
  )
}

// 잘려나간 조각
const FallingPiece = ({ position, size, color, removeSelf }) => {
  const meshRef = useRef()
  const speedY = useRef(0)
  const rotationSpeed = useRef({
    x: (Math.random() - 0.5) * 0.15,
    z: (Math.random() - 0.5) * 0.15
  })

  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    speedY.current -= 12 * delta * 0.5
    meshRef.current.position.y += speedY.current * delta * 5
    meshRef.current.rotation.x += rotationSpeed.current.x
    meshRef.current.rotation.z += rotationSpeed.current.z

    if (meshRef.current.position.y < -30) {
      removeSelf()
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} transparent opacity={0.9} />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color="black" linewidth={1} transparent opacity={0.3} />
      </lineSegments>
    </mesh>
  )
}

// Perfect 효과
const PerfectEffect = ({ position }) => {
  const [opacity, setOpacity] = useState(1)
  const [scale, setScale] = useState(0.8)
  
  useFrame((state, delta) => {
    setOpacity(prev => Math.max(0, prev - delta * 1.5))
    setScale(prev => Math.min(1.5, prev + delta * 2))
  })

  if (opacity <= 0) return null

  return (
    <Text
      position={[position[0], position[1] + 2.5, position[2]]}
      fontSize={1.4}
      color="#FFFFFF"
      scale={scale}
      anchorX="center"
      anchorY="middle"
      fillOpacity={opacity}
      outlineWidth={0.08}
      outlineColor="#FF00FF"
    >
      PERFECT!
    </Text>
  )
}

// 메인 게임 씬
const GameScene = ({ gameState, setGameState, onScoreUpdate, onGameOver }) => {
  const [stack, setStack] = useState([]) 
  const [debris, setDebris] = useState([]) 
  const [effects, setEffects] = useState([]) 
  const [activeBlockInfo, setActiveBlockInfo] = useState(null) 
  
  const activeBlockRef = useRef(null) 
  const activeBlockData = useRef(null) 
  const stackRef = useRef([]) 

  const levelRef = useRef(0)
  const comboRef = useRef(0)
  const maxComboRef = useRef(0)
  const perfectCountRef = useRef(0)
  const cameraRef = useRef()
  const scoreRef = useRef(0)
  const ambientLightRef = useRef()
  const dirLightRef = useRef()

  useEffect(() => {
    stackRef.current = stack
  }, [stack])

  const createNewBlock = (prevBlock, level) => {
    const direction = level % 2 === 0 ? 'x' : 'z'
    const color = COLORS[level % COLORS.length]
    
    const prevPos = prevBlock ? prevBlock.position : [0, -BOX_HEIGHT, 0]
    const prevSize = prevBlock ? prevBlock.size : [INITIAL_SIZE, BOX_HEIGHT, INITIAL_SIZE]
    
    const dist = 12 
    const startPos = [...prevPos]
    startPos[1] = level * BOX_HEIGHT
    
    if (direction === 'x') {
      startPos[0] = -dist
    } else {
      startPos[2] = -dist
    }

    return {
      position: startPos,
      size: [...prevSize],
      color: color,
      direction: direction,
      speed: BASE_SPEED + level * SPEED_INCREMENT,
      moveDir: 1
    }
  }

  // 게임 초기화
  useEffect(() => {
    if (gameState === 'start_game_signal') {
      const initialBlock = { 
        position: [0, 0, 0], 
        size: [INITIAL_SIZE, BOX_HEIGHT, INITIAL_SIZE], 
        color: COLORS[0],
        isBase: true
      }
      
      setStack([initialBlock])
      stackRef.current = [initialBlock]
      setDebris([])
      setEffects([])
      setActiveBlockInfo(null)
      
      levelRef.current = 1
      comboRef.current = 0
      maxComboRef.current = 0
      perfectCountRef.current = 0
      scoreRef.current = 0
      
      const newBlock = createNewBlock(initialBlock, 1)
      activeBlockData.current = newBlock
      setActiveBlockInfo(newBlock)
      
      if (cameraRef.current) {
        cameraRef.current.position.set(20, CAMERA_POS_Y_OFFSET, 20)
        cameraRef.current.lookAt(0, CAMERA_LOOK_OFFSET, 0)
        cameraRef.current.zoom = 55
        cameraRef.current.updateProjectionMatrix()
      }
      
      setGameState('playing')
    }
  }, [gameState, setGameState])

  // 입력 처리
  useEffect(() => {
    const handleInput = (e) => {
      if (gameState !== 'playing') return
      if (e.target.closest('button') || e.target.closest('.game-ui')) return
      placeBlock()
    }
    window.addEventListener('pointerdown', handleInput)
    return () => window.removeEventListener('pointerdown', handleInput)
  }, [gameState])

  const placeBlock = () => {
    if (!activeBlockData.current) return

    const current = activeBlockData.current
    const prev = stackRef.current[stackRef.current.length - 1]
    
    const isX = current.direction === 'x'
    const delta = isX ? current.position[0] - prev.position[0] : current.position[2] - prev.position[2]
    const absDelta = Math.abs(delta)
    const sizeIndex = isX ? 0 : 2
    const size = current.size[sizeIndex]
    
    const ERROR_MARGIN = 0.15 
    
    let newSize = [...current.size]
    let newPos = [...current.position]
    
    if (absDelta > size) {
      gameOver()
      return
    }

    if (absDelta < ERROR_MARGIN) {
      // Perfect
      comboRef.current += 1
      if (comboRef.current > maxComboRef.current) maxComboRef.current = comboRef.current
      perfectCountRef.current += 1
      
      if (isX) newPos[0] = prev.position[0]
      else newPos[2] = prev.position[2]
      
      setEffects(prev => [...prev, { id: Date.now(), position: newPos }])
      
      if (comboRef.current >= 5) {
        newSize[0] = Math.min(newSize[0] + 0.3, INITIAL_SIZE)
        newSize[2] = Math.min(newSize[2] + 0.3, INITIAL_SIZE)
      }
    } else {
      // Cut
      comboRef.current = 0
      
      const remaining = size - absDelta
      newSize[sizeIndex] = remaining
      
      const prevMin = isX ? prev.position[0] - prev.size[0]/2 : prev.position[2] - prev.size[2]/2
      const prevMax = isX ? prev.position[0] + prev.size[0]/2 : prev.position[2] + prev.size[2]/2
      const currMin = isX ? current.position[0] - current.size[0]/2 : current.position[2] - current.size[2]/2
      const currMax = isX ? current.position[0] + current.size[0]/2 : current.position[2] + current.size[2]/2
      
      const overlapMin = Math.max(prevMin, currMin)
      const overlapMax = Math.min(prevMax, currMax)
      const center = overlapMin + (overlapMax - overlapMin) / 2

      if (isX) newPos[0] = center
      else newPos[2] = center
      
      const debrisSize = [ ...current.size ]
      const debrisPos = [ ...current.position ]
      
      if (isX) {
        debrisSize[0] = absDelta
        debrisPos[0] = current.position[0] > prev.position[0] ? overlapMax + absDelta/2 : overlapMin - absDelta/2
      } else {
        debrisSize[2] = absDelta
        debrisPos[2] = current.position[2] > prev.position[2] ? overlapMax + absDelta/2 : overlapMin - absDelta/2
      }
      addDebris(debrisPos, debrisSize, current.color)
    }
    
    scoreRef.current += 1
    onScoreUpdate({
      score: scoreRef.current,
      combo: comboRef.current,
      maxCombo: maxComboRef.current
    })

    const newBlock = { position: newPos, size: newSize, color: current.color }
    setStack(prev => [...prev, newBlock])
    
    levelRef.current += 1
    const nextBlock = createNewBlock(newBlock, levelRef.current)
    activeBlockData.current = nextBlock
    setActiveBlockInfo(nextBlock)
  }
  
  const addDebris = (position, size, color) => {
    setDebris(prev => [...prev, { id: Date.now() + Math.random(), position, size, color }])
  }

  const gameOver = () => {
    if (activeBlockData.current) {
      addDebris(activeBlockData.current.position, activeBlockData.current.size, activeBlockData.current.color)
    }
    activeBlockData.current = null
    setGameState('gameover')
    onGameOver({
      score: scoreRef.current,
      maxCombo: maxComboRef.current,
      perfectCount: perfectCountRef.current
    })
  }

  // Animation Loop
  useFrame((state, delta) => {
    if (gameState !== 'playing' || !activeBlockData.current) return
    
    const block = activeBlockData.current
    const moveAmount = block.speed * 60 * delta 
    const limit = 12

    if (block.direction === 'x') {
      block.position[0] += moveAmount * block.moveDir
      if (block.position[0] > limit || block.position[0] < -limit) block.moveDir *= -1
    } else {
      block.position[2] += moveAmount * block.moveDir
      if (block.position[2] > limit || block.position[2] < -limit) block.moveDir *= -1
    }
    
    if (activeBlockRef.current) {
      activeBlockRef.current.position.set(...block.position)
    }

    // 카메라 추적 개선
    if (cameraRef.current) {
      const currentHeight = levelRef.current * BOX_HEIGHT
      // 상단 여백을 일정하게 유지하기 위해 바라보는 지점을 블록보다 약간 위로 설정
      const targetLookAtY = currentHeight + CAMERA_LOOK_OFFSET
      // 카메라 위치는 바라보는 지점에 맞춰 일정 거리만큼 상승
      const targetY = targetLookAtY + (CAMERA_POS_Y_OFFSET - CAMERA_LOOK_OFFSET)

      cameraRef.current.position.y = THREE.MathUtils.lerp(cameraRef.current.position.y, targetY, 0.08)
      cameraRef.current.lookAt(0, cameraRef.current.position.y - (CAMERA_POS_Y_OFFSET - CAMERA_LOOK_OFFSET), 0) 
      cameraRef.current.updateProjectionMatrix()
    }

    // 조명 업데이트 (낮 -> 우주)
    if (ambientLightRef.current && dirLightRef.current) {
      const progress = Math.min(1, levelRef.current / 50)
      const targetAmbient = 0.8 - (0.5 * progress) // 0.8 -> 0.3
      const targetDir = 1.0 - (0.6 * progress)     // 1.0 -> 0.4
      ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, targetAmbient, 0.05)
      dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, targetDir, 0.05)
    }
  })

  // Start 화면 애니메이션
  useFrame((state) => {
    if (gameState === 'start' && cameraRef.current) {
      const t = state.clock.getElapsedTime() * 0.3
      const r = 25
      cameraRef.current.position.set(Math.sin(t) * r, 15, Math.cos(t) * r)
      cameraRef.current.lookAt(0, 5, 0)
      cameraRef.current.zoom = 55
      cameraRef.current.updateProjectionMatrix()
    }
  })

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[20, CAMERA_POS_Y_OFFSET, 20]}
        zoom={55}
        near={-100}
        far={200}
      />
      
      <ambientLight ref={ambientLightRef} intensity={0.8} />
      <directionalLight ref={dirLightRef} position={[10, 25, 10]} intensity={1.0} castShadow />
      
      {/* 부드러운 그림자 효과 - 바닥 밀착 */}
      <ContactShadows 
        position={[0, -0.45, 0]} 
        opacity={0.5} 
        scale={30} 
        blur={2.5} 
        far={5} 
        color="#000000"
      />

      {stack.map((block, i) => (
        <StaticBlock key={`stack-${i}`} {...block} />
      ))}
      
      {debris.map((piece) => (
        <FallingPiece 
          key={piece.id} 
          {...piece} 
          removeSelf={() => setDebris(prev => prev.filter(p => p.id !== piece.id))} 
        />
      ))}

      {activeBlockInfo && (
        <mesh ref={activeBlockRef} position={activeBlockInfo.position}>
          <boxGeometry args={activeBlockInfo.size} />
          <meshStandardMaterial color={activeBlockInfo.color} />
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(...activeBlockInfo.size)]} />
            <lineBasicMaterial color="black" linewidth={1} transparent opacity={0.4} />
          </lineSegments>
        </mesh>
      )}

      {effects.map(effect => (
        <PerfectEffect key={effect.id} position={effect.position} />
      ))}
    </>
  )
}

const StackGame = () => {
  const [gameState, setGameState] = useState('start')
  const [currentScore, setCurrentScore] = useState({ score: 0, combo: 0, maxCombo: 0 })
  const [highScores, setHighScores] = useState([])
  const [playerName, setPlayerName] = useState('')

  useEffect(() => {
    let storedId = localStorage.getItem('stack_game_guest_id')
    if (!storedId) {
      storedId = `Guest_${Math.floor(Math.random() * 10000)}`
      localStorage.setItem('stack_game_guest_id', storedId)
    }
    setPlayerName(storedId)
    fetchRank()
  }, [])

  const fetchRank = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/stack/rank')
      if (res.ok) {
        const data = await res.json()
        setHighScores(data)
      }
    } catch (e) {
      console.error("Failed to fetch rank", e)
    }
  }

  const handleGameOver = async (results) => {
    try {
      await fetch('http://localhost:5000/api/stack/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          player: playerName, 
          score: results.score,
          maxCombo: results.maxCombo,
          perfectCount: results.perfectCount
        }),
      })
      fetchRank()
    } catch (e) {
      console.error("Failed to save score", e)
    }
  }

  const startGame = () => {
    setCurrentScore({ score: 0, combo: 0, maxCombo: 0 })
    setGameState('start_game_signal')
  }

  const handleScreenClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.ranking-board')) return
    if (gameState === 'start') startGame()
  }

  const maxScoreForSpace = 50
  const bgPositionY = Math.max(0, 100 - (currentScore.score / maxScoreForSpace) * 100)

  return (
    <div 
      className="stack-game-container" 
      onClick={handleScreenClick}
      style={{ backgroundPositionY: `${bgPositionY}%` }}
    >
      <div className="game-ui">
        {gameState === 'playing' && (
          <div className="score-container">
            <h2 className="score-display">{currentScore.score}</h2>
            {currentScore.combo > 0 && (
              <div className="combo-display">
                {currentScore.combo} COMBO
              </div>
            )}
          </div>
        )}

        {gameState === 'start' && (
          <div className="start-screen-arcade">
            <div className="title-area">
              <h1 className="arcade-title">STACK<br/>BLOCK</h1>
              <p className="touch-msg">TOUCH TO START</p>
            </div>
            
            <div className="ranking-board">
              <h3>🏆 RANKING</h3>
              <ul>
                {highScores.slice(0, 5).map((h, i) => (
                  <li key={i}>
                    <span>{i+1}. {h.player}</span>
                    <span>{h.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="gameover-screen">
            <h2>GAME OVER</h2>
            <div className="final-score">{currentScore.score}</div>
            <div className="stats-grid">
              <div>Max Combo: {currentScore.maxCombo}</div>
            </div>
            
            <div className="action-buttons">
              <button className="restart-btn" onClick={startGame}>RETRY</button>
              <button className="home-btn" onClick={() => setGameState('start')}>HOME</button>
            </div>
          </div>
        )}
      </div>

      <div className="canvas-container">
        <Canvas shadows dpr={[1, 2]}>
          <GameScene 
            gameState={gameState} 
            setGameState={setGameState}
            onScoreUpdate={setCurrentScore}
            onGameOver={handleGameOver}
          />
        </Canvas>
      </div>
    </div>
  )
}

export default StackGame
