import { NavLink } from 'react-router-dom'
import './pages.css'

function JieunAlcoholCategory() {
  return (
    <section id="center">
      <div>
        <h1>술게임</h1>
        <p>원하는 술게임을 선택하세요.</p>

        <div className="home-actions">
          <NavLink className="home-link" to="/jieun/alcohol/beer">
            맥주 따르기
          </NavLink>
        </div>
      </div>
    </section>
  )
}

export default JieunAlcoholCategory

