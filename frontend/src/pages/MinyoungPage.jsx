import { useState } from 'react'
import './pages.css'
import BeerPourGame from './BeerPourGame'

function MinyoungPage() {
  const [view, setView] = useState('category') // category | beer

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
            </div>
          </>
        ) : (
          <BeerPourGame />
        )}
      </div>
    </section>
  )
}

export default MinyoungPage

