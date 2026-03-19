import {
  BrowserRouter,
  Navigate,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom'
import MinyoungPage from './pages/MinyoungPage'
import MinyoungAlcoholCategory from './pages/MinyoungAlcoholCategory'
import JieunPage from './pages/JieunPage'
import YeonheePage from './pages/yeonheePage'

import YeonheeAlcoholCategory from './pages/YeonheeAlcoholCategory'
import BeerPourGame from './pages/BeerPourGame'
import CampusMapGame from './pages/CampusMapGame'
import WhiteMouseAvoidGame from './pages/WhiteMouseAvoidGame'
import CreditGame from './pages/CreditGame'

import GuessNumberGame from './pages/GuessNumberGame'
import MoleGame from './pages/MoleGame'
import StackGame from './pages/StackGame'
import JiEun2Game from './pages/JiEun2Game'
import Home from './pages/Home'
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
          element={<CreditGame />}
        />
        <Route
          path="/games/guess/jieun2"
          element={<JiEun2Game />}
        />
        <Route
          path="/games/stack"
          element={<StackGame />}
        />

        <Route
          path="/games/guess/yeonhee"
          element={<GuessNumberGame playerId="yeonhee" playerName="연희님" />}
        />
        <Route path="/" element={<Navigate to="/minyoung" replace />} />

        <Route path="/minyoung" element={<MinyoungPage />} />
        <Route path="/minyoung/alcohol" element={<MinyoungAlcoholCategory />} />
        <Route path="/minyoung/alcohol/beer" element={<BeerPourGame />} />
        <Route path="/minyoung/alcohol/map" element={<CampusMapGame />} />
        <Route path="/minyoung/alcohol/mouse" element={<WhiteMouseAvoidGame />} />

        <Route path="/jieun" element={<JieunPage />} />
        <Route path="/jieun/alcohol" element={<Navigate to="/jieun" replace />} />
        <Route path="/jieun/alcohol/beer" element={<Navigate to="/jieun" replace />} />
        <Route path="/jieun/credit" element={<CreditGame />} />


        <Route path="/yeonhee" element={<YeonheePage />} />
        <Route path="/yeonhee/alcohol" element={<YeonheeAlcoholCategory />} />
        <Route path="/yeonhee/alcohol/beer" element={<BeerPourGame />} />
        <Route path="/yeonhee/stack" element={<StackGame />} />
        <Route path="/yeonhee/mole" element={<MoleGame />} />

        {/* 예전 경로 호환 */}
        <Route path="/games/guess/minyoung" element={<Navigate to="/minyoung" replace />} />
        <Route path="/games/guess/jieun" element={<Navigate to="/jieun" replace />} />
        <Route path="/games/guess/yeonhee" element={<Navigate to="/yeonhee" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

