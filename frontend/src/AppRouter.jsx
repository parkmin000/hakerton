import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom'
import Home from './pages/Home'
import GuessNumberGame from './pages/GuessNumberGame'
import CreditGame from './pages/CreditGame'
import './App.css'

function AppRouter() {
  return (
    <BrowserRouter>
      <nav className="app-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          게임 목록
        </NavLink>
        <NavLink
          to="/games/guess/minyoung"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          민영님
        </NavLink>
        <NavLink
          to="/games/guess/jieun"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          지은님
        </NavLink>
        <NavLink
          to="/games/guess/yeonhee"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          연희님
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/games/guess/minyoung"
          element={<GuessNumberGame playerId="minyoung" playerName="민영님" />}
        />
        <Route
          path="/games/guess/jieun"
          element={<CreditGame />}
        />
        <Route
          path="/games/guess/yeonhee"
          element={<GuessNumberGame playerId="yeonhee" playerName="연희님" />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

