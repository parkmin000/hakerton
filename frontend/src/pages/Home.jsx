import { NavLink } from 'react-router-dom'
import './pages.css'

function Home() {
  return (
    <section id="center">
      <div className="home-hero">
        <h1 className="home-title">최선을 다했습니다</h1>
        <p className="home-subtitle">뭘 좋아할지 몰라서 다 준비한 팀</p>

        <div className="home-actions">
          <NavLink className="home-link" to="/minyoung/alcohol/beer">
            진성 술게임, 맥주 따르기
          </NavLink>
          <NavLink className="home-link" to="/minyoung/alcohol/map">
            캠퍼스 속, 미루 하루를 찾아라
          </NavLink>
          <NavLink className="home-link" to="/yeonhee/stack">
            블록 쌓기 게임
          </NavLink>
          <NavLink className="home-link" to="/games/guess/jieun2">
            차곡차곡 시간표 테트리스
          </NavLink>
          <NavLink className="home-link" to="/minyoung/alcohol/mouse">
            요리조리 미루 하루 피하기
          </NavLink>
          <NavLink className="home-link" to="/jieun/credit">
            학점 올리기 게임
          </NavLink>
          <NavLink className="home-link" to="/yeonhee/mole">
            하루 내리고, 미루 올려
          </NavLink>
        </div>
      </div>
    </section>
  )
}

export default Home
