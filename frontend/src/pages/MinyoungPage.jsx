import { useState } from 'react'
import './pages.css'
import BeerPourGame from './BeerPourGame'
import CampusMapGame from './CampusMapGame'

function MinyoungPage() {
  const [view, setView] = useState('category') // category | beer | map

  return (
    <section id="center">
      <div>
        {view === 'category' ? (
          <>
            <p>술게임 카테고리</p>

            <div className="home-actions">
              <button className="home-link" type="button" onClick={() => setView('beer')}>
                맥주 따르기
              </button>
              <button className="home-link" type="button" onClick={() => setView('map')}>
                지도 게임
              </button>
            </div>
          </>
        ) : view === 'beer' ? (
          <BeerPourGame />
        ) : (
          <CampusMapGame />
        )}
      </div>
    </section>
  )
}

export default MinyoungPage

