import { useEffect, useMemo, useRef, useState } from 'react';
import pourImg from '../assets/beer-pour.png';
import cupEmptyImg from '../assets/cup-empty.png';
import background from '../assets/background.png';
import welcomeBgImg from '../assets/welcomesul.jpg';

function clampInt(n, min, max) {
  const v = Math.round(n);
  return Math.min(max, Math.max(min, v));
}

function dist(a, b) {
  return Math.abs(a - b);
}

function BeerPourGame() {
  const [stage, setStage] = useState('setup'); // setup | playing | result
  const [playerCount, setPlayerCount] = useState(3);
  const [target, setTarget] = useState(50);

  const [turn, setTurn] = useState(0);
  const [running, setRunning] = useState(false);
  const [fill, setFill] = useState(0); // 0..100 (현재 붓는 퍼센트)

  const [finalValues, setFinalValues] = useState([]); // 각 플레이어 최종값(퍼센트)
  const finalValuesRef = useRef([]);

  const [result, setResult] = useState(null);

  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const fillRef = useRef(0);

  const [waitingForNext, setWaitingForNext] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 빠르게 차오르게(초당 퍼센트 증가) - 대학생 앱용으로 더 빠르게
  const speed = useMemo(() => 60, []);

  useEffect(() => {
    fillRef.current = fill;
  }, [fill]);

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const next = clampInt(fillRef.current + speed * dt, 0, 100);
      fillRef.current = next;
      setFill(next);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, speed]);

  function resetToSetup() {
    setStage('setup');
    setRunning(false);
    setTurn(0);
    setFill(0);
    fillRef.current = 0;
    lastTsRef.current = 0;
    setFinalValues([]);
    finalValuesRef.current = [];
    setResult(null);
  }

  function startGame() {
    const values = new Array(playerCount).fill(null);
    finalValuesRef.current = values;
    setFinalValues(values);

    setResult(null);
    setStage('playing');
    setTurn(0);

    setFill(0);
    fillRef.current = 0;
    lastTsRef.current = 0;

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 0) {
          clearInterval(timer);
          setRunning(true);
          return -1;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopPour() {
    if (stage !== 'playing') return;
    if (!running) return;

    setRunning(false);
    const finalValue = clampInt(fillRef.current, 1, 100);
    setFill(finalValue);

    const nextValues = [...finalValuesRef.current];
    nextValues[turn] = finalValue;
    finalValuesRef.current = nextValues;
    setFinalValues(nextValues);

    const nextTurn = turn + 1;
    if (nextTurn >= playerCount) {
      const entries = nextValues.map((v, i) => ({
        id: i,
        name: `플레이어 ${i + 1}`,
        value: v ?? 0,
        diff: dist(v ?? 0, target),
      }));

      entries.sort((a, b) => a.diff - b.diff);

      setResult({
        target,
        winnerId: entries[0]?.id ?? 0,
        all: entries,
      });
      setStage('result');
      return;
    }

    // 다음 플레이어 차례
    setWaitingForNext(true);
  }

  function nextPlayer() {
    setWaitingForNext(false);
    setTurn((prev) => prev + 1);
    setFill(0);
    fillRef.current = 0;
    lastTsRef.current = 0;

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 0) {
          clearInterval(timer);
          setRunning(true);
          return -1;
        }
        return prev - 1;
      });
    }, 1000);
  }


  return (
    <section id="center">
      <div className="beer-game-shell">
        <div className="beer-game-board" style={{ background: 'transparent', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}>
          <div className="beer-game">
        {stage === 'setup' ? (
          <>
            <h1>맥주 따르기 술게임</h1>


            <div className="beer-welcome-banner">
              <img className="beer-welcome-img" src={welcomeBgImg} alt="바텐더 환영 배경" />
              <p className="beer-welcome-bubble">
                목표 퍼센트와 플레이어 수를 정한 뒤 시작하세요.<br />
                각 플레이어 컵이 자동으로
                차오르고 탭하면 멈춰요.
              </p>
            </div>

            <div className="beer-setup">
              <div className="beer-row">
                <span className="beer-tag">플레이어 수</span>
                <code>{playerCount}명</code>
              </div>
              <input
                className="beer-slider"
                type="range"
                min={2}
                max={6}
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
              />

              <div className="beer-row">
                <span className="beer-tag">목표값</span>
                <code>{target}%</code>
              </div>
              <input
                className="beer-slider"
                type="range"
                min={1}
                max={100}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </div>

             <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button className="counter" type="button" onClick={startGame}>
                시작
              </button>
            </div>
          </>
        ) : null}

        {stage === 'playing' ? (
          <>
            <h1>플레이어 {turn + 1} 차례 (목표 {target}%)</h1>
            <p className="beer-sub">
              맥주 컵이 <code>자동으로 차오릅니다</code>. 원하는 순간에 컵을 <code>탭</code>해서 멈춰주세요.
            </p>

            <div className="beer-cups" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {waitingForNext ? (
                <button style={{ color: 'white' }} className="counter" type="button" onClick={nextPlayer}>
                  다음 플레이어
                </button>
              ) : countdown >= 0 ? (
                <div className="countdown" style={{ color: '#fff' }}>
                  {countdown === 0 ? 'Start!' : countdown}
                </div>
              ) : (
                <div
                  className={`beer-cup active pouring`}
                  role="button"
                  tabIndex={0}
                  aria-label={`플레이어 ${turn + 1} 컵`}
                  onClick={stopPour}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') stopPour();
                  }}
                >
                  {running ? (
                    <img className="beer-pour-img" src={pourImg} alt="" aria-hidden="true" />
                  ) : null}

                  <div className="cup-stage" aria-hidden="true">
                    <div className="cup-mask" style={{ '--fill': fill }}>
                      <div className="cup-inner">
                        <div className="cup-liquid" />
                        <div className="cup-foam" />
                      </div>
                    </div>
                    <img className="cup-img" src={cupEmptyImg} alt="" />
                  </div>
                  <div className="beer-cup-label">
                    플레이어 {turn + 1}
                    <div>
                      {running ? (
                        <>
                          현재: <code>{fill}%</code>
                        </>
                      ) : (
                        <>
                          최종: <code>{finalValues[turn]}%</code>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}

        {stage === 'result' && result ? (
          <>
            <h1>결과</h1>
            <p className="beer-sub">
              목표값: <code>{result.target}%</code>
            </p>

            <div className="beer-result">
              {result.all.map((p, idx) => (
                <div
                  key={p.id}
                  className={`beer-result-row ${p.id === result.winnerId ? 'winner' : ''}`}
                >
                  <div className="beer-result-name">
                    {p.name} {idx === 0 ? <span className="beer-win">1등</span> : null}
                  </div>
                  <div className="beer-result-meta">
                    값 <code>{p.value}%</code>
                  </div>
                </div>
              ))}
            </div>

            <div className="beer-actions">
              <button className="counter" type="button" onClick={startGame}>
                다시 게임
              </button>
              <button className="counter" type="button" onClick={resetToSetup}>
                설정으로
              </button>
            </div>
          </>
        ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BeerPourGame;
