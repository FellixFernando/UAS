import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Zap, Crown, Sparkles, Star } from 'lucide-react';

const TicTacToe = ({ onChangeWorld }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  
  // Add styles to make the game fullscreen and overlay everything
  const fullScreenStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    backgroundColor: '#1a1b26'
  };
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [gameMode, setGameMode] = useState('player');
  const [isThinking, setIsThinking] = useState(false);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [tournamentWinner, setTournamentWinner] = useState(null);
  const [roundCount, setRoundCount] = useState(0);
  const [playerWonGame, setPlayerWonGame] = useState(false);

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (squares) => {
    for (let line of winningLines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line };
      }
    }
    return null;
  };

  const minimax = (squares, depth, isMaximizing) => {
    const result = checkWinner(squares);

    if (result && result.winner === 'O') return 10 - depth;
    if (result && result.winner === 'X') return depth - 10;
    if (squares.every(square => square !== null)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const getBestMove = (squares) => {
    // Jika sudah draw 3 kali, buat AI lebih "bodoh"
    if (scores.draws >= 3) {
      // Cari gerakan yang membiarkan player X menang
      for (let i = 0; i < 9; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          if (!checkWinner(squares)) {
            squares[i] = null;
            return i;
          }
          squares[i] = null;
        }
      }
      // Jika tidak ada gerakan yang membuat X menang, pilih gerakan random
      const emptySquares = squares.reduce((acc, square, index) => 
        square === null ? [...acc, index] : acc, []);
      return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }

    // AI normal jika belum 3 kali draw
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  };

  const handleClick = (index) => {
    if (board[index] || winner || isThinking) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      const newScores = { ...scores, [result.winner]: scores[result.winner] + 1 };
      setScores(newScores);
      setRoundCount(prev => prev + 1);

      if (result.winner === 'X') {
        setTimeout(() => {
          setTournamentWinner('X');
          setShowVictoryModal(true);
        }, 1500);
      }
    } else if (newBoard.every(square => square !== null)) {
      setWinner('draw');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      setRoundCount(prev => prev + 1);
    } else {
      setIsXNext(!isXNext);
    }
  };

  useEffect(() => {
    if (!isXNext && gameMode === 'ai' && !winner && !isThinking) {
      setIsThinking(true);
      setTimeout(() => {
        const bestMove = getBestMove([...board]);
        if (bestMove !== null) {
          const newBoard = [...board];
          newBoard[bestMove] = 'O';
          setBoard(newBoard);

          const result = checkWinner(newBoard);
          if (result) {
            setWinner(result.winner);
            setWinningLine(result.line);
            const newScores = { ...scores, [result.winner]: scores[result.winner] + 1 };
            setScores(newScores);
            setRoundCount(prev => prev + 1);

            if (result.winner === 'X') {
              setTimeout(() => {
                setTournamentWinner('X');
                setShowVictoryModal(true);
              }, 1500);
            }
          } else if (newBoard.every(square => square !== null)) {
            setWinner('draw');
            setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
            setRoundCount(prev => prev + 1);
          } else {
            setIsXNext(true);
          }
        }
        setIsThinking(false);
      }, 800);
    }
  }, [isXNext, board, gameMode, winner, isThinking, scores]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine([]);
    setIsThinking(false);
  };

  const nextGame = () => {
    resetGame();
  };

  const resetTournament = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    setRoundCount(0);
    setShowVictoryModal(false);
    setTournamentWinner(null);
    resetGame();
  };

  const XIcon = ({ isWinning, size = "text-6xl lg:text-7xl xl:text-8xl" }) => (
    <div className={`${size} font-black transition-all duration-700 transform ${isWinning ? 'animate-pulse scale-110' : ''
      }`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 bg-clip-text text-transparent blur-sm">
          ✕
        </div>
        <div className="relative bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
          ✕
        </div>
      </div>
    </div>
  );

  const OIcon = ({ isWinning, size = "text-6xl lg:text-7xl xl:text-8xl" }) => (
    <div className={`${size} font-black transition-all duration-700 transform ${isWinning ? 'animate-pulse scale-110' : ''
      }`}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 to-red-600 bg-clip-text text-transparent blur-sm">
          ●
        </div>
        <div className="relative bg-gradient-to-br from-pink-300 via-red-500 to-rose-600 bg-clip-text text-transparent drop-shadow-lg">
          ●
        </div>
      </div>
    </div>
  );

  const Cell = ({ value, index, onClick, isWinning, isThinking }) => (
    <button
      onClick={() => onClick(index)}
      disabled={value || winner || isThinking}
      className={`
        relative w-28 h-28 lg:w-32 lg:h-32 xl:w-36 xl:h-36 2xl:w-40 2xl:h-40
        border-4 bg-gradient-to-br from-slate-800/90 to-slate-900/90
        rounded-2xl lg:rounded-3xl shadow-2xl transition-all duration-500 ease-out backdrop-blur-sm
        hover:shadow-3xl hover:scale-105 hover:from-slate-700/90 hover:to-slate-800/90
        disabled:cursor-not-allowed active:scale-95 group
        ${isWinning ? 'animate-pulse bg-gradient-to-br from-yellow-600/30 to-amber-700/30 border-yellow-400 shadow-yellow-400/30' : 'border-slate-600/50 hover:border-slate-500/70'}
        ${!value && !winner && !isThinking ? 'hover:border-slate-400/70 hover:shadow-slate-400/20' : ''}
      `}
    >
      <div className={`
        flex items-center justify-center h-full transition-all duration-700 transform
        ${value ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
      `}>
        {value === 'X' && <XIcon isWinning={isWinning} />}
        {value === 'O' && <OIcon isWinning={isWinning} />}
      </div>

      {!value && !winner && !isThinking && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-30 transition-all duration-300">
          {isXNext ? <XIcon isWinning={false} size="text-4xl lg:text-5xl xl:text-6xl" /> : <OIcon isWinning={false} size="text-4xl lg:text-5xl xl:text-6xl" />}
        </div>
      )}

      {isWinning && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl lg:rounded-3xl">
          <div className="absolute top-2 left-2 animate-ping">
            <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-yellow-400" />
          </div>
          <div className="absolute bottom-2 right-2 animate-ping delay-300">
            <Star className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 text-amber-400" />
          </div>
        </div>
      )}
    </button>
  );

  const VictoryModal = () => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl p-6 lg:p-8 max-w-md lg:max-w-lg w-full mx-4 lg:mx-6 border border-slate-600/30 shadow-2xl animate-scale-in">
        <div className="text-center">
          <div className="mb-4 lg:mb-6 animate-bounce">
            <Crown className="w-16 h-16 lg:w-20 lg:h-20 text-yellow-400 mx-auto mb-3 lg:mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 lg:mb-3">🎉 TOURNAMENT CHAMPION! 🎉</h2>
          </div>

          <div className="bg-slate-700/30 rounded-xl lg:rounded-2xl p-4 lg:p-6 mb-4 lg:mb-6 border border-slate-600/30">
            <div className="flex items-center justify-center gap-2 lg:gap-3 mb-3 lg:mb-4">
              {tournamentWinner === 'X' ? <XIcon isWinning={true} size="text-5xl lg:text-6xl" /> : <OIcon isWinning={true} size="text-5xl lg:text-6xl" />}
            </div>
            <p className="text-xl lg:text-2xl font-bold text-white mb-2 lg:mb-3">
              Player {tournamentWinner} Wins the Tournament!
            </p>
            <p className="text-base lg:text-lg text-slate-300">
              First to reach 3 victories in {roundCount} rounds
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <div className="bg-cyan-500/20 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-cyan-400/20">
              <div className="text-cyan-300 font-bold text-base lg:text-lg">Player X</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{scores.X}</div>
            </div>
            <div className="bg-yellow-500/20 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-yellow-400/20">
              <div className="text-yellow-300 font-bold text-base lg:text-lg">Draws</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{scores.draws}</div>
            </div>
            <div className="bg-pink-500/20 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-pink-400/20">
              <div className="text-pink-300 font-bold text-base lg:text-lg">Player O</div>
              <div className="text-2xl lg:text-3xl font-bold text-white">{scores.O}</div>
            </div>
          </div>          <button
            onClick={() => {
              onChangeWorld('city');
              resetTournament();
            }}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 lg:py-4 px-4 lg:px-6 rounded-xl font-bold text-base lg:text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-green-500/30"
          >
            <Trophy className="w-5 h-5 lg:w-6 lg:h-6" />
            Go to city
          </button>
        </div>
      </div>
    </div>
  );
  return (
    <div style={fullScreenStyle} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col lg:flex-row items-center justify-center relative overflow-hidden">{/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-slate-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 bg-slate-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 lg:w-128 lg:h-128 bg-slate-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>      {/* Left Panel - Game Controls */}
      <div className="relative w-full lg:w-[30%] pr-0 lg:pr-4 mb-6 lg:mb-0 h-full">
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl p-5 lg:p-7 border border-slate-600/30 h-full">
          {/* Header */}          <div className="text-center mb-5 lg:mb-7">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-3 lg:mb-4 flex items-center justify-center gap-3">
              <Zap className="text-yellow-400 animate-pulse w-5 h-5 lg:w-6 lg:h-6" />
              Tic Tac Toe
              <Zap className="text-yellow-400 animate-pulse w-5 h-5 lg:w-6 lg:h-6" />
            </h1>
            <p className="text-base lg:text-lg text-slate-300 mb-4 lg:mb-5">First to 1 win takes the championship!</p>

            {/* Game Mode Selection */}
            <div className="flex justify-center gap-3 lg:gap-4 mb-5 lg:mb-7">
         
              <button
                onClick={() => setGameMode('ai')}
                className={`px-4 lg:px-5 py-2.5 rounded-xl font-semibold text-base lg:text-lg transition-all duration-300 ${gameMode === 'ai'
                    ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg transform scale-105 border border-slate-500/50'
                    : 'bg-slate-700/30 text-slate-300 hover:bg-slate-600/40 hover:scale-105 border border-slate-600/30'
                  }`}
              >
                vs AI
              </button>
            </div>
            <p className='text-base lg:text-lg text-slate-300 mb-4 lg:mb-5'>Tolong di pencet tombol vs AI nya</p>
          </div>

          {/* Game Status */}
          <div className="text-center mb-5 lg:mb-7">
            {winner ? (
              <div className="animate-bounce">
                {winner === 'draw' ? (
                  <p className="text-lg lg:text-xl text-yellow-400 font-bold">🤝 It's a Draw!</p>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-lg lg:text-xl text-green-400 font-bold flex items-center gap-2">
                      <Trophy className="text-yellow-400 animate-spin w-5 h-5 lg:w-6 lg:h-6" />
                      Player {winner} Wins Round {roundCount}!
                    </p>
                  </div>
                )}
              </div>
            ) : isThinking ? (
              <p className="text-lg lg:text-xl text-slate-300 animate-pulse">🤖 AI is thinking...</p>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <p className="text-lg lg:text-xl text-slate-300">Current turn:</p>
                {isXNext ? <XIcon isWinning={false} size="text-2xl lg:text-3xl" /> : <OIcon isWinning={false} size="text-2xl lg:text-3xl" />}
              </div>
            )}
          </div>

          {/* Tournament Progress */}
          <div className="bg-slate-700/20 rounded-xl lg:rounded-2xl p-4 lg:p-5 mb-5 lg:mb-7 border border-slate-600/30">
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-4 lg:mb-5 text-center flex items-center justify-center gap-3">
              <Crown className="text-yellow-400 w-5 h-5 lg:w-6 lg:h-6" />
              Tournament Progress
            </h3>
            <div className="grid grid-cols-3 gap-3 lg:gap-4 text-center mb-4 lg:mb-5">
              <div className="bg-cyan-500/20 rounded-xl p-3 lg:p-4 border border-cyan-400/20">
                <div className="text-cyan-300 font-bold text-sm lg:text-base">Player X</div>
                <div className="text-xl lg:text-2xl font-bold text-white">{scores.X}</div>
              </div>
              <div className="bg-yellow-500/20 rounded-xl p-3 lg:p-4 border border-yellow-400/20">
                <div className="text-yellow-300 font-bold text-sm lg:text-base">Draws</div>
                <div className="text-xl lg:text-2xl font-bold text-white">{scores.draws}</div>
              </div>
              <div className="bg-pink-500/20 rounded-xl p-3 lg:p-4 border border-pink-400/20">
                <div className="text-pink-300 font-bold text-sm lg:text-base">Player O</div>
                <div className="text-xl lg:text-2xl font-bold text-white">{scores.O}</div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col gap-3 lg:gap-4">
            {winner ? (
              <button
                onClick={nextGame}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-3 lg:py-4 px-4 lg:px-5 rounded-xl font-bold text-base lg:text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-green-500/30"
              >
                <Zap className="w-5 h-5" />
                Next Round
              </button>
            ) : (
              <button
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 lg:py-4 px-4 lg:px-5 rounded-xl font-bold text-base lg:text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-3 border border-blue-500/30"
              >
                <RotateCcw className="w-5 h-5" />
                Reset Round
              </button>
            )}
            <button
              onClick={resetTournament}
              className="w-full bg-gradient-to-r from-red-600 to-pink-700 text-white py-3 lg:py-4 px-4 lg:px-5 rounded-xl font-bold text-base lg:text-lg transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 border border-red-500/30"
            >
              New Tournament
            </button>
          </div>
        </div>
      </div>      {/* Right Panel - Game Board */}
      <div className="relative w-full lg:w-[70%] flex items-center justify-center h-full">
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl p-6 lg:p-8 border border-slate-600/30">
          <div className="grid grid-cols-3 gap-4 lg:gap-6 xl:gap-8 p-4 lg:p-6 xl:p-8 bg-slate-700/20 rounded-2xl lg:rounded-3xl border border-slate-600/20">
            {board.map((cell, index) => (
              <Cell
                key={index}
                value={cell}
                index={index}
                onClick={handleClick}
                isWinning={winningLine.includes(index)}
                isThinking={isThinking}
              />
            ))}
          </div>
        </div>
      </div>

      {showVictoryModal && <VictoryModal />}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TicTacToe;