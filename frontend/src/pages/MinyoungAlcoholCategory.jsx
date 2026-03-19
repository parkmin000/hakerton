import { NavLink } from 'react-router-dom'
import './pages.css'

function MinyoungAlcoholCategory() {
  return (
    <section id="center">
      <div>
        <h1>술게임</h1>
        <p>원하는 술게임을 선택하세요.</p>

        <div className="home-actions">
          <NavLink className="home-link" to="/minyoung/alcohol/beer">
            맥주 따르기
          </NavLink>
          <NavLink className="home-link" to="/minyoung/alcohol/map">
            지도 게임
          </NavLink>
        </div>
      </div>
    </section>
  )
}

export default MinyoungAlcoholCategory

