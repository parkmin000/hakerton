import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom'
import Home from './pages/Home'
import GuessNumberGame from './pages/GuessNumberGame'
import './App.css'

function AppRouter() {
  return (
    <BrowserRouter>
      <nav className="app-nav">
        <NavLink
          to="/minyoung"
          end
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          민영 페이지
        </NavLink>
        <NavLink
          to="/jieun"
          end
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          지은 페이지
        </NavLink>
        <NavLink
          to="/yeonhee"
          end
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          연희 페이지
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
          element={<GuessNumberGame playerId="jieun" playerName="지은님" />}
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

