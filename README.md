# Hakerton Fullstack Starter (React + Node)

## 요구사항
- Node.js (v18+ 권장)

## 설치
각 폴더에서 의존성을 설치했습니다. 필요하면 아래처럼 실행하세요.
- `frontend`: `npm install`
- `backend`: `npm install`

## 실행
1. 백엔드 실행 (별도 터미널)
   - `cd backend`
   - `npm run dev`
2. 프론트엔드 실행 (별도 터미널)
   - `cd frontend`
   - `npm run dev`

브라우저에서 `frontend`의 Vite 주소(보통 http://localhost:5173 )로 접속하면, 프론트가 `/api/hello`를 호출하고 응답을 화면에 표시합니다.

## 백엔드 API
- `GET /api/health` : `{ "status": "ok" }`
- `GET /api/hello` : `{ "message": "...", "time": "..." }`

