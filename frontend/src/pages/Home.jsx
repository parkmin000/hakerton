import { NavLink } from 'react-router-dom'
import './pages.css'

function Home() {
  return (
    <section id="center">
      <div>
        <h1>게임 목록</h1>
        <p>아래에서 게임을 선택하세요.</p>

        <div className="home-actions">
          <NavLink className="home-link" to="/games/guess/minyoung">
            민영님
          </NavLink>
          <NavLink className="home-link" to="/games/guess/jieun">
            지은님
          </NavLink>
          <NavLink className="home-link" to="/games/mole">
            두더지 게임
          </NavLink>
          <NavLink className="home-link" to="/games/guess/jieun2">
            지은2님
          </NavLink>
          <NavLink className="home-link" to="/games/guess/yeonhee">
            연희님
          </NavLink>
        </div>
      </div>
    </section>
  )
}

export default Home
