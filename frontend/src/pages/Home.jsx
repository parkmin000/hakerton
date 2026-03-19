import { NavLink } from 'react-router-dom'
import './pages.css'

function Home() {
  return (
    <section id="center">
      <div>
        <div className="home-actions">
          <NavLink className="home-link" to="/minyoung">
            맥주 따르기
          </NavLink>
          <NavLink className="home-link" to="/minyoung/alcohol/map">
            지도 게임
          </NavLink>
          <NavLink className="home-link" to="/yeonhee/stack">
            블록쌓기
          </NavLink>
          <NavLink className="home-link" to="/games/guess/jieun2">
            테트리스
          </NavLink>
          <NavLink className="home-link" to="/minyoung/alcohol/mouse">
            피하기
          </NavLink>
          <NavLink className="home-link" to="/jieun/credit">
            학점받기
          </NavLink>
          <NavLink className="home-link" to="/yeonhee/mole">
            두더지잡기
          </NavLink>
        </div>
      </div>
    </section>
  )
}

export default Home
