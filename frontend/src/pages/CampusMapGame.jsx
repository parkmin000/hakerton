import { useEffect, useMemo, useRef, useState } from 'react'
import './pages.css'

const CENTER = { lat: 37.5665, lng: 126.978 } // 기본 좌표(원하면 학교 좌표로 교체)
const RADIUS_M = 1000
const MIN_GAP_M = 200
const CHARACTER_COUNT = 5
const HIT_RADIUS_PX = 50

const CHARACTER_NAMES = ['토리', '모리', '루루', '초코', '버디']

const toRad = (deg) => (deg * Math.PI) / 180
const toDeg = (rad) => (rad * 180) / Math.PI

function distanceMeters(a, b) {
  const R = 6371000
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return 2 * R * Math.asin(Math.sqrt(x))
}

function moveFromCenter(center, bearingRad, distanceM) {
  const R = 6371000
  const lat1 = toRad(center.lat)
  const lng1 = toRad(center.lng)
  const ang = distanceM / R

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(ang) + Math.cos(lat1) * Math.sin(ang) * Math.cos(bearingRad),
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(ang) * Math.cos(lat1),
      Math.cos(ang) - Math.sin(lat1) * Math.sin(lat2),
    )

  return { lat: toDeg(lat2), lng: toDeg(lng2) }
}

function randomPointInRadius(center, radiusM) {
  const angle = Math.random() * Math.PI * 2
  const dist = Math.sqrt(Math.random()) * radiusM
  return moveFromCenter(center, angle, dist)
}

function generateCharacters() {
  const chars = []
  let guard = 0
  while (chars.length < CHARACTER_COUNT && guard < 2000) {
    guard += 1
    const point = randomPointInRadius(CENTER, RADIUS_M)
    const ok = chars.every((c) => distanceMeters(c.position, point) >= MIN_GAP_M)
    if (!ok) continue
    chars.push({
      id: chars.length,
      name: CHARACTER_NAMES[chars.length] ?? `캐릭터 ${chars.length + 1}`,
      position: point,
      found: false,
    })
  }
  return chars
}

function loadKakaoSdk(appKey) {
  return new Promise((resolve, reject) => {
    if (!appKey) {
      reject(new Error('VITE_KAKAO_MAP_KEY 환경변수가 필요합니다.'))
      return
    }
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao))
      return
    }

    const existing = document.querySelector('script[data-kakao-sdk="true"]')
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(() => resolve(window.kakao)))
      existing.addEventListener('error', () => reject(new Error('카카오맵 SDK 로드 실패')))
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.dataset.kakaoSdk = 'true'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}`
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'))
    document.head.appendChild(script)
  })
}

function CampusMapGame() {
  const mapRef = useRef(null)
  const miniMapRef = useRef(null)

  const mainMapObjRef = useRef(null)
  const miniMapObjRef = useRef(null)
  const miniRectRef = useRef(null)
  const charMarkersRef = useRef([])
  const miniMarkersRef = useRef([])

  const [characters, setCharacters] = useState([])
  const [timeSec, setTimeSec] = useState(0)
  const [finished, setFinished] = useState(false)
  const [error, setError] = useState('')

  const totalFound = useMemo(() => characters.filter((c) => c.found).length, [characters])

  useEffect(() => {
    if (finished) return
    const timer = setInterval(() => {
      setTimeSec((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [finished])

  useEffect(() => {
    setCharacters(generateCharacters())
    setTimeSec(0)
    setFinished(false)
    setError('')
  }, [])

  useEffect(() => {
    if (!characters.length) return

    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY
    let cleanupListeners = []
    let cancelled = false

    loadKakaoSdk(appKey)
      .then((kakao) => {
        if (cancelled || !mapRef.current || !miniMapRef.current) return

        const centerLatLng = new kakao.maps.LatLng(CENTER.lat, CENTER.lng)

        const mainMap = new kakao.maps.Map(mapRef.current, {
          center: centerLatLng,
          level: 4,
        })
        mainMapObjRef.current = mainMap

        const miniMap = new kakao.maps.Map(miniMapRef.current, {
          center: centerLatLng,
          level: 6,
          draggable: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
        })
        miniMapObjRef.current = miniMap

        new kakao.maps.Marker({ map: mainMap, position: centerLatLng })
        new kakao.maps.Circle({
          map: mainMap,
          center: centerLatLng,
          radius: RADIUS_M,
          strokeWeight: 2,
          strokeColor: '#6b7cff',
          strokeOpacity: 0.85,
          fillColor: '#6b7cff',
          fillOpacity: 0.08,
        })

        new kakao.maps.Circle({
          map: miniMap,
          center: centerLatLng,
          radius: RADIUS_M,
          strokeWeight: 1,
          strokeColor: '#6b7cff',
          strokeOpacity: 0.8,
          fillColor: '#6b7cff',
          fillOpacity: 0.08,
        })

        const markers = characters.map((c) => {
          const marker = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(c.position.lat, c.position.lng),
            content:
              '<div style="width:12px;height:12px;border-radius:999px;background:#ff4971;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.25)"></div>',
            xAnchor: 0.5,
            yAnchor: 0.5,
          })
          marker.setMap(mainMap)
          return marker
        })
        charMarkersRef.current = markers

        const miniMarkers = characters.map((c) => {
          const m = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(c.position.lat, c.position.lng),
            content:
              '<div style="width:8px;height:8px;border-radius:999px;background:#ff4971;border:1px solid #fff"></div>',
            xAnchor: 0.5,
            yAnchor: 0.5,
          })
          m.setMap(miniMap)
          return m
        })
        miniMarkersRef.current = miniMarkers

        miniRectRef.current = new kakao.maps.Rectangle({
          map: miniMap,
          bounds: mainMap.getBounds(),
          strokeWeight: 2,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.9,
          fillOpacity: 0,
        })

        const updateMiniRect = () => {
          if (!miniRectRef.current || !mainMapObjRef.current) return
          miniRectRef.current.setBounds(mainMapObjRef.current.getBounds())
        }

        const clampCenterInRadius = () => {
          const current = mainMap.getCenter()
          const now = { lat: current.getLat(), lng: current.getLng() }
          const d = distanceMeters(CENTER, now)
          if (d <= RADIUS_M) return
          const bearing = Math.atan2(now.lng - CENTER.lng, now.lat - CENTER.lat)
          const clamped = moveFromCenter(CENTER, bearing, RADIUS_M - 5)
          mainMap.setCenter(new kakao.maps.LatLng(clamped.lat, clamped.lng))
        }

        const onClickMap = (mouseEvent) => {
          if (finished) return
          const projection = mainMap.getProjection()
          if (!projection) return
          const clickPoint = projection.pointFromCoords(mouseEvent.latLng)

          let hitIndex = -1
          characters.forEach((c, idx) => {
            if (c.found || hitIndex !== -1) return
            const charPoint = projection.pointFromCoords(
              new kakao.maps.LatLng(c.position.lat, c.position.lng),
            )
            const dx = clickPoint.x - charPoint.x
            const dy = clickPoint.y - charPoint.y
            if (Math.hypot(dx, dy) <= HIT_RADIUS_PX) {
              hitIndex = idx
            }
          })

          if (hitIndex === -1) return

          setCharacters((prev) => {
            const next = prev.map((item, idx) => (idx === hitIndex ? { ...item, found: true } : item))
            return next
          })
        }

        kakao.maps.event.addListener(mainMap, 'dragend', clampCenterInRadius)
        kakao.maps.event.addListener(mainMap, 'zoom_changed', clampCenterInRadius)
        kakao.maps.event.addListener(mainMap, 'idle', updateMiniRect)
        kakao.maps.event.addListener(mainMap, 'click', onClickMap)

        cleanupListeners = [
          () => kakao.maps.event.removeListener(mainMap, 'dragend', clampCenterInRadius),
          () => kakao.maps.event.removeListener(mainMap, 'zoom_changed', clampCenterInRadius),
          () => kakao.maps.event.removeListener(mainMap, 'idle', updateMiniRect),
          () => kakao.maps.event.removeListener(mainMap, 'click', onClickMap),
        ]
      })
      .catch((e) => {
        setError(e.message || '지도 로드 중 오류가 발생했습니다.')
      })

    return () => {
      cancelled = true
      cleanupListeners.forEach((fn) => fn())
      charMarkersRef.current.forEach((m) => m.setMap(null))
      miniMarkersRef.current.forEach((m) => m.setMap(null))
      charMarkersRef.current = []
      miniMarkersRef.current = []
      if (miniRectRef.current) miniRectRef.current.setMap(null)
      miniRectRef.current = null
    }
  }, [characters.length, finished])

  useEffect(() => {
    if (!charMarkersRef.current.length) return
    characters.forEach((c, idx) => {
      const marker = charMarkersRef.current[idx]
      const miniMarker = miniMarkersRef.current[idx]
      if (!marker || !miniMarker) return
      marker.setMap(c.found ? null : mainMapObjRef.current)
      miniMarker.setMap(c.found ? null : miniMapObjRef.current)
    })

    if (characters.length > 0 && characters.every((c) => c.found)) {
      setFinished(true)
    }
  }, [characters])

  const onRestart = () => {
    setCharacters(generateCharacters())
    setTimeSec(0)
    setFinished(false)
    setError('')
  }

  return (
    <section id="center">
      <div className="map-game-wrap">
        <h1>지도 게임</h1>
        <p className="map-game-sub">캠퍼스 안에 숨어있는 캐릭터 5개를 모두 찾아보세요.</p>

        {error ? <p className="map-game-error">{error}</p> : null}

        <div className="map-game-meta">
          <span>
            찾은 캐릭터: <code>{totalFound}/5</code>
          </span>
          <span>
            타이머: <code>{timeSec}초</code>
          </span>
          <span>
            판정 반경: <code>{HIT_RADIUS_PX}px</code>
          </span>
        </div>

        {finished ? (
          <div className="map-game-result">
            <h2>클리어!</h2>
            <p>
              걸린 시간: <code>{timeSec}초</code>
            </p>
            <button className="counter" type="button" onClick={onRestart}>
              다시 시작
            </button>
          </div>
        ) : (
          <div className="map-game-stage">
            <div ref={mapRef} className="map-game-main" />

            <div className="map-game-side">
              <h3>찾을 캐릭터</h3>
              <ul className="map-character-list">
                {characters.map((c) => (
                  <li key={c.id} className={c.found ? 'found' : ''}>
                    <span>{c.found ? '✅' : '⬜'}</span>
                    <span>{c.name}</span>
                  </li>
                ))}
              </ul>
              <button className="counter" type="button" onClick={onRestart}>
                새 배치
              </button>
            </div>

            <div className="map-game-mini-wrap">
              <div ref={miniMapRef} className="map-game-mini" />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default CampusMapGame

