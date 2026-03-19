import { useEffect, useMemo, useRef, useState } from 'react'
import './pages.css'
import haruImg from '../assets/haru.png'
import miruImg from '../assets/miru.png'

const CENTER = { lat: 37.459944, lng: 126.951958 } // 서울대학교(관악캠퍼스) 기준
const RADIUS_M = 300 // 0.3km
const MIN_GAP_M = 45
const CHARACTER_COUNT = 10
const HIT_RADIUS_PX = 50
const MAIN_MAP_LEVEL = 1 // 1이 가장 확대된 레벨
const LIMIT_SEC = 60

const CHARACTER_NAMES = Array.from({ length: CHARACTER_COUNT }).map((_, i) => `마루 ${i + 1}`)

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
  const miruIndex = 0
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
      isMiru: chars.length === miruIndex,
    })
  }
  return chars
}

function loadKakaoSdk(appKey) {
  return new Promise((resolve, reject) => {
    const origin = window.location.origin
    const keyHint = appKey ? `${appKey.slice(0, 6)}...` : '없음'

    if (!appKey) {
      reject(new Error(`VITE_KAKAO_MAP_KEY 환경변수가 필요합니다. (origin: ${origin})`))
      return
    }
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao))
      return
    }

    const existing = document.querySelector('script[data-kakao-sdk="true"]')
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(() => resolve(window.kakao)))
      existing.addEventListener('error', () =>
        reject(
          new Error(
            `카카오맵 SDK 로드 실패 (기존 스크립트). Kakao Developers Web 도메인에 ${origin} 등록 여부와 JavaScript 키 사용 여부를 확인해주세요. key: ${keyHint}`,
          ),
        ),
      )
      return
    }

    const script = document.createElement('script')
    script.async = true
    script.dataset.kakaoSdk = 'true'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}`
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = () =>
      reject(
        new Error(
          `카카오맵 SDK 로드 실패. Kakao Developers Web 도메인에 ${origin} 등록 여부와 JavaScript 키 사용 여부를 확인해주세요. key: ${keyHint}`,
        ),
      )
    document.head.appendChild(script)
  })
}

function CampusMapGame() {
  const mapRef = useRef(null)

  const mainMapObjRef = useRef(null)
  const charMarkersRef = useRef([])

  const [characters, setCharacters] = useState([])
  const [timeSec, setTimeSec] = useState(LIMIT_SEC)
  const [finished, setFinished] = useState(false)
  const [failed, setFailed] = useState(false)
  const [error, setError] = useState('')

  const totalFound = useMemo(() => characters.filter((c) => c.found).length, [characters])

  useEffect(() => {
    if (finished || failed) return
    const timer = setInterval(() => {
      setTimeSec((prev) => {
        if (prev <= 1) {
          setFailed(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [finished, failed])

  useEffect(() => {
    setCharacters(generateCharacters())
    setTimeSec(LIMIT_SEC)
    setFinished(false)
    setFailed(false)
    setError('')
  }, [])

  useEffect(() => {
    if (!characters.length) return

    const appKey = import.meta.env.VITE_KAKAO_MAP_KEY
    let cleanupListeners = []
    let cancelled = false

    loadKakaoSdk(appKey)
      .then((kakao) => {
        if (cancelled || !mapRef.current) return

        const centerLatLng = new kakao.maps.LatLng(CENTER.lat, CENTER.lng)

        const mainMap = new kakao.maps.Map(mapRef.current, {
          center: centerLatLng,
          level: MAIN_MAP_LEVEL,
          scrollwheel: false,
          disableDoubleClick: true,
          disableDoubleClickZoom: true,
        })
        mainMapObjRef.current = mainMap
        mainMap.setZoomable(false) // 확대/축소 완전 비활성화

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

        const markers = characters.map((c) => {
          const marker = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(c.position.lat, c.position.lng),
            content:
              `<img src="${c.isMiru ? miruImg : haruImg}" alt="${c.name}" style="width:${c.isMiru ? 20 : 34}px;height:${c.isMiru ? 20 : 34}px;object-fit:contain;filter:drop-shadow(0 1px 3px rgba(0,0,0,.35));" />`,
            xAnchor: 0.5,
            yAnchor: 0.5,
          })
          marker.setMap(mainMap)
          return marker
        })
        charMarkersRef.current = markers

        const clampPointInRadius = (point) => {
          const d = distanceMeters(CENTER, point)
          if (d <= RADIUS_M) return point
          const bearing = Math.atan2(point.lng - CENTER.lng, point.lat - CENTER.lat)
          return moveFromCenter(CENTER, bearing, RADIUS_M - 5)
        }

        const clampCenterInRadius = () => {
          const current = mainMap.getCenter()
          const now = { lat: current.getLat(), lng: current.getLng() }
          const clamped = clampPointInRadius(now)
          if (clamped.lat === now.lat && clamped.lng === now.lng) return
          mainMap.setCenter(new kakao.maps.LatLng(clamped.lat, clamped.lng))
        }

        const onClickMap = (mouseEvent) => {
          if (finished || failed) return
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

        kakao.maps.event.addListener(mainMap, 'center_changed', clampCenterInRadius)
        kakao.maps.event.addListener(mainMap, 'dragend', clampCenterInRadius)
        kakao.maps.event.addListener(mainMap, 'zoom_changed', clampCenterInRadius)
        kakao.maps.event.addListener(mainMap, 'click', onClickMap)

        cleanupListeners = [
          () => kakao.maps.event.removeListener(mainMap, 'center_changed', clampCenterInRadius),
          () => kakao.maps.event.removeListener(mainMap, 'dragend', clampCenterInRadius),
          () => kakao.maps.event.removeListener(mainMap, 'zoom_changed', clampCenterInRadius),
          () => kakao.maps.event.removeListener(mainMap, 'click', onClickMap),
        ]
      })
      .catch((e) => {
        console.error('[CampusMapGame] Kakao SDK error:', e)
        setError(e.message || '지도 로드 중 오류가 발생했습니다.')
      })

    return () => {
      cancelled = true
      cleanupListeners.forEach((fn) => fn())
      charMarkersRef.current.forEach((m) => m.setMap(null))
      charMarkersRef.current = []
    }
  }, [characters.length, finished, failed])

  useEffect(() => {
    if (!charMarkersRef.current.length) return
    characters.forEach((c, idx) => {
      const marker = charMarkersRef.current[idx]
      if (!marker) return
      marker.setMap(c.found ? null : mainMapObjRef.current)
    })

    if (!failed && characters.length > 0 && characters.every((c) => c.found)) {
      setFinished(true)
    }
  }, [characters, failed])

  const onRestart = () => {
    setCharacters(generateCharacters())
    setTimeSec(LIMIT_SEC)
    setFinished(false)
    setFailed(false)
    setError('')
  }

  return (
    <section id="center">
      <div className="map-game-wrap">
        <p className="map-game-sub">캠퍼스 안에 숨어있는 마루 10마리를 60초 안에 모두 찾아보세요.</p>

        {error ? <p className="map-game-error">{error}</p> : null}

        <div className="map-game-meta">
          <span>
            남은 시간: <code>{timeSec}초</code>
          </span>
        </div>

        {finished || failed ? (
          <div className="map-game-result">
            <h2>{finished ? '성공!' : '실패!'}</h2>
            {finished ? (
              <p>
                남은 시간: <code>{timeSec}초</code>
              </p>
            ) : (
              <p>60초 안에 모두 찾지 못했어요.</p>
            )}
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

          </div>
        )}

        <div className="map-haru-progress" aria-label="찾은 마루 진행도">
          {characters.map((c) => (
            <img
              key={c.id}
              src={c.isMiru ? miruImg : haruImg}
              alt={c.name}
              className={`map-haru-item ${c.found ? 'found' : ''}`}
              style={{ width: c.isMiru ? '20px' : '34px', height: c.isMiru ? '20px' : '34px' }}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CampusMapGame

