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
import JieunAlcoholCategory from './pages/JieunAlcoholCategory'
import YeonheePage from './pages/YeonheePage'
import YeonheeAlcoholCategory from './pages/YeonheeAlcoholCategory'
import BeerPourGame from './pages/BeerPourGame'
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
        <Route path="/" element={<Navigate to="/minyoung" replace />} />
        <Route path="/minyoung" element={<MinyoungPage />} />
        <Route path="/minyoung/alcohol" element={<MinyoungAlcoholCategory />} />
        <Route path="/minyoung/alcohol/beer" element={<BeerPourGame />} />
        <Route path="/jieun" element={<JieunPage />} />
        <Route path="/jieun/alcohol" element={<JieunAlcoholCategory />} />
        <Route path="/jieun/alcohol/beer" element={<BeerPourGame />} />
        <Route path="/yeonhee" element={<YeonheePage />} />
        <Route path="/yeonhee/alcohol" element={<YeonheeAlcoholCategory />} />
        <Route path="/yeonhee/alcohol/beer" element={<BeerPourGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

