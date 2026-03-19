import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SetupPage from './pages/SetupPage';
import CardSelectPage from './pages/CardSelectPage';
import DrawPage from './pages/DrawPage';
import ResultPage from './pages/ResultPage';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/select" element={<CardSelectPage />} />
          <Route path="/draw" element={<DrawPage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
