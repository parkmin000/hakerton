import { NavLink } from 'react-router-dom'
import './pages.css'

function YeonheePage() {
  return (
    <section id="center">
      <div>
        <h1>연희 페이지</h1>
        <p>카테고리를 선택하세요.</p>

        <div className="home-actions">
          <NavLink className="home-link" to="/yeonhee/alcohol">
            술게임
          </NavLink>
        </div>
      </div>
    </section>
  )
}

export default YeonheePage

