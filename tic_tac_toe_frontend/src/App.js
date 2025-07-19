import React, { useState, useEffect } from 'react';
import './App.css';

// Colors from work item
const COLORS = {
  primary: '#1976D2',
  secondary: '#424242',
  accent: '#FFC107',
};

function getInitialBoard() {
  return Array(9).fill(null);
}

// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /** Calculates if a board has a winner. Returns 'X', 'O' or null. */
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // Rows
    [0,3,6],[1,4,7],[2,5,8], // Cols
    [0,4,8],[2,4,6] // Diags
  ];
  for (let [a, b, c] of lines) {
    if (
      squares[a] && 
      squares[a] === squares[b] && 
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function getAvailableMoves(squares) {
  /** Returns indexes of empty squares. */
  return squares.map((sq, i) => sq === null ? i : null).filter(i => i !== null);
}

// PUBLIC_INTERFACE
function isBoardFull(squares) {
  /** Returns true if no moves left. */
  return squares.every(sq => sq !== null);
}

// PUBLIC_INTERFACE
function aiMove(squares, aiMark, humanMark) {
  /** Very simple minimax AI for tic tac toe, optimized for code length. */
  const winner = calculateWinner(squares);
  if (winner === aiMark) return { score: 1 };
  if (winner === humanMark) return { score: -1 };
  if (isBoardFull(squares)) return { score: 0 };

  // Maximizing for AI
  let best = null;
  if (aiMark === 'O') {
    let maxEval = -Infinity;
    for (const idx of getAvailableMoves(squares)) {
      const squaresCopy = [...squares];
      squaresCopy[idx] = aiMark;
      const { score } = aiMove(squaresCopy, humanMark, aiMark);
      if (score > maxEval) {
        maxEval = score;
        best = idx;
      }
      if (score === 1) break;
    }
    if (best == null) best = getAvailableMoves(squares)[0];
    return { idx: best, score: maxEval };
  } else {
    let maxEval = -Infinity;
    for (const idx of getAvailableMoves(squares)) {
      const squaresCopy = [...squares];
      squaresCopy[idx] = aiMark;
      const { score } = aiMove(squaresCopy, humanMark, aiMark);
      if (score > maxEval) {
        maxEval = score;
        best = idx;
      }
      if (score === 1) break;
    }
    if (best == null) best = getAvailableMoves(squares)[0];
    return { idx: best, score: maxEval };
  }
}

// PUBLIC_INTERFACE
function Square({ value, onClick, disabled }) {
  /** Represents a single Tic Tac Toe square. */
  return (
    <button
      className="ttt-square"
      style={{
        color: value === 'X' ? COLORS.primary : value === 'O' ? COLORS.accent : COLORS.secondary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: 'transparent',
      }}
      onClick={onClick}
      disabled={disabled}
      aria-label={value ? `Cell: ${value}` : "Empty cell"}
    >
      {value}
    </button>
  );
}

// PUBLIC_INTERFACE
function Board({ squares, onSquareClick, gameActive }) {
  /** Renders the 3x3 board. */
  return (
    <div className="ttt-board" aria-label="Tic Tac Toe Board">
      {squares.map((val, i) => (
        <Square 
          key={i} 
          value={val} 
          onClick={() => onSquareClick(i)} 
          disabled={val !== null || !gameActive}
        />
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function ScoreBoard({ scores, mode }) {
  /** Displays current scores based on play mode. */
  return (
    <div className="ttt-scoreboard">
      <div className="ttt-score ttt-score-x">
        {mode === 'single' ? "Player (X)" : "Player 1 (X)"}: <b>{scores.X}</b>
      </div>
      <div className="ttt-score ttt-score-o">
        {mode === 'single' ? "AI (O)" : "Player 2 (O)"}: <b>{scores.O}</b>
      </div>
      <div className="ttt-score ttt-score-tie">Ties: <b>{scores.tie}</b></div>
    </div>
  );
}

function Controls({ onModeChange, mode, onRestart, gameActive, showRestart = true }) {
  /** Provides mode select and reset. */
  return (
    <div className="ttt-controls">
      <div className="ttt-mode">
        <button
          className={mode === 'single' ? 'ttt-btn ttt-btn-active' : 'ttt-btn'}
          style={{ background: mode === 'single' ? COLORS.primary : COLORS.secondary }}
          onClick={() => onModeChange('single')}
          disabled={gameActive && mode === 'single'}
        >
          Single Player
        </button>
        <button
          className={mode === 'two' ? 'ttt-btn ttt-btn-active' : 'ttt-btn'}
          style={{ background: mode === 'two' ? COLORS.primary : COLORS.secondary }}
          onClick={() => onModeChange('two')}
          disabled={gameActive && mode === 'two'}
        >
          Two Player
        </button>
      </div>
      {showRestart && (
        <button
          className="ttt-btn ttt-btn-reset"
          style={{ background: COLORS.accent, color: '#222', marginLeft: 16 }}
          onClick={onRestart}
        >
          Restart Game
        </button>
      )}
    </div>
  );
}

function getStatusText(winner, gameActive, mode, isXNext) {
  if (winner) {
    if (winner === 'tie') return "It's a tie!";
    if (mode === 'single') {
      if (winner === 'X') return "You win! 🎉";
      if (winner === 'O') return 'AI wins!';
    }
    return winner === 'X' ? "Player 1 wins!" : "Player 2 wins!";
  }
  if (!gameActive) return '';
  if (mode === 'single') return isXNext ? 'Your turn' : "AI's turn";
  return isXNext ? "Player 1's turn" : "Player 2's turn";
}

// PUBLIC_INTERFACE
function App() {
  /** Main App for Tic Tac Toe game frontend. */
  // 'single' = vs AI, 'two' = vs human
  const [mode, setMode] = useState('single');
  // Game state
  const [board, setBoard] = useState(getInitialBoard());
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null); // 'X', 'O', or 'tie'
  const [scores, setScores] = useState({ X: 0, O: 0, tie: 0 });
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // AI Turn for single player mode
  useEffect(() => {
    if (
      mode === 'single' &&
      !winner && 
      !isXNext
    ) {
      // Delay for realism
      const timeout = setTimeout(() => {
        const { idx } = aiMove(
          board, 'O', 'X'
        );
        if (typeof idx === 'number' && board[idx] === null) {
          handleSquare(idx, 'O');
        }
      }, 420);

      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [isXNext, mode, winner, board]);

  // Determines and updates winner/tie
  useEffect(() => {
    const w = calculateWinner(board);
    if (w) {
      setWinner(w);
      setScores(s => ({ ...s, [w]: s[w] + 1 }));
    } else if (isBoardFull(board)) {
      setWinner('tie');
      setScores(s => ({ ...s, tie: s.tie + 1 }));
    }
  }, [board]);

  // PUBLIC_INTERFACE
  const handleSquare = (idx, markOverride) => {
    if (board[idx] !== null || winner) return;
    const nextMark = markOverride || (isXNext ? 'X' : 'O');
    const newBoard = [...board];
    newBoard[idx] = nextMark;
    setBoard(newBoard);
    setIsXNext(m => !m);
  };

  // PUBLIC_INTERFACE
  const handleBoardClick = idx => {
    if (!winner && (mode === 'two' || (mode === 'single' && isXNext))) {
      handleSquare(idx);
    }
  };

  // PUBLIC_INTERFACE
  const handleRestart = () => {
    setBoard(getInitialBoard());
    setIsXNext(true);
    setWinner(null);
  };

  // PUBLIC_INTERFACE
  const handleModeChange = m => {
    if (m !== mode) {
      setMode(m);
      setScores({ X: 0, O: 0, tie: 0 });
      setBoard(getInitialBoard());
      setIsXNext(true);
      setWinner(null);
    }
  };

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const gameActive = !winner && getAvailableMoves(board).length > 0;

  return (
    <div className="App" style={{ fontFamily: 'system-ui, sans-serif', minHeight: "100vh" }}>
      <header className="App-header" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <div style={{ width: "100%", flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{
            color: COLORS.primary,
            marginBottom: 0,
            fontWeight: 'bold',
            fontSize: '2.2rem',
            textShadow: '1px 1px 0 #fff, 0px 2px 6px rgba(0,0,0,0.05)'
          }}>Tic Tac Toe</h1>
          <div style={{ marginBottom: 12, fontSize: "1rem", color: COLORS.secondary, opacity: 0.7 }}>
            Play against AI or a friend – enjoy classic Tic Tac Toe!
          </div>
          <ScoreBoard scores={scores} mode={mode} />
          <Board squares={board} onSquareClick={handleBoardClick} gameActive={gameActive} />
          <div className="ttt-status"
               style={{
                 minHeight: 32,
                 margin: "18px 0 0 0",
                 color: winner === 'X' ? COLORS.primary : winner === 'O' ? COLORS.accent : COLORS.secondary,
                 fontWeight: 600,
                 fontSize: '1.1rem'
               }}
               aria-live="polite"
          >
            {getStatusText(winner, gameActive, mode, isXNext)}
          </div>
          <Controls
            mode={mode}
            onModeChange={handleModeChange}
            onRestart={handleRestart}
            gameActive={gameActive}
            showRestart={true}
          />
        </div>
        <footer style={{ fontSize: 14, marginTop: 26, opacity: 0.5, padding: 8 }}>
          &copy; {new Date().getFullYear()} Tic Tac Toe – Powered by React, minimal UI
        </footer>
      </header>
    </div>
  );
}

export default App;
