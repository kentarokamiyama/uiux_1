import React, { useState, useEffect, useCallback } from 'react';
import './Tetris.css';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const EMPTY_CELL = 0;

const TETROMINOS = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0]
    ],
    color: 'cyan'
  },
  O: {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: 'yellow'
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'purple'
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0]
    ],
    color: 'green'
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0]
    ],
    color: 'red'
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'blue'
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0]
    ],
    color: 'orange'
  }
};

const createEmptyBoard = () => {
  return Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));
};

const getRandomTetromino = () => {
  const keys = Object.keys(TETROMINOS);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return {
    shape: TETROMINOS[randomKey].shape,
    color: TETROMINOS[randomKey].color,
    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[randomKey].shape[0].length / 2),
    y: 0
  };
};

const rotatePiece = (piece) => {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
  
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[j][rows - 1 - i] = piece.shape[i][j];
    }
  }
  
  return { ...piece, shape: rotated };
};

const isValidMove = (board, piece, newX, newY) => {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] !== 0) {
        const boardX = newX + x;
        const boardY = newY + y;
        
        if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
          return false;
        }
        
        if (boardY >= 0 && board[boardY][boardX] !== EMPTY_CELL) {
          return false;
        }
      }
    }
  }
  return true;
};

const placePiece = (board, piece) => {
  const newBoard = board.map(row => [...row]);
  
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x] !== 0) {
        const boardX = piece.x + x;
        const boardY = piece.y + y;
        if (boardY >= 0) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }
  
  return newBoard;
};

const clearLines = (board) => {
  const newBoard = board.filter(row => row.some(cell => cell === EMPTY_CELL));
  const linesCleared = BOARD_HEIGHT - newBoard.length;
  
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(EMPTY_CELL));
  }
  
  return { board: newBoard, linesCleared };
};

const Tetris = () => {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState(getRandomTetromino());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const dropPiece = useCallback(() => {
    if (gameOver || isPaused) return;

    const newY = currentPiece.y + 1;
    if (isValidMove(board, currentPiece, currentPiece.x, newY)) {
      setCurrentPiece({ ...currentPiece, y: newY });
    } else {
      const newBoard = placePiece(board, currentPiece);
      const { board: clearedBoard, linesCleared } = clearLines(newBoard);
      setBoard(clearedBoard);
      setScore(prevScore => prevScore + linesCleared * 100 * level);
      setLevel(prevLevel => Math.floor((score + linesCleared * 100 * level) / 1000) + 1);
      const newPiece = getRandomTetromino();
      if (!isValidMove(clearedBoard, newPiece, newPiece.x, newPiece.y)) {
        setGameOver(true);
      }
      setCurrentPiece(newPiece);
    }
  }, [board, currentPiece, gameOver, isPaused, level, score]);

  const movePiece = useCallback((dx, dy) => {
    if (gameOver || isPaused) return;

    setCurrentPiece(prev => {
      const newX = prev.x + dx;
      const newY = prev.y + dy;
      
      if (isValidMove(board, prev, newX, newY)) {
        return { ...prev, x: newX, y: newY };
      }
      
      return prev;
    });
  }, [board, gameOver, isPaused]);

  const rotatePieceHandler = useCallback(() => {
    if (gameOver || isPaused) return;

    setCurrentPiece(prev => {
      const rotated = rotatePiece(prev);
      
      if (isValidMove(board, rotated, prev.x, prev.y)) {
        return rotated;
      }
      
      return prev;
    });
  }, [board, gameOver, isPaused]);

  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return;

    setCurrentPiece(prev => {
      let newY = prev.y;
      
      while (isValidMove(board, prev, prev.x, newY + 1)) {
        newY++;
      }
      
      return { ...prev, y: newY };
    });
  }, [board, gameOver, isPaused]);

  const restartGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPiece(getRandomTetromino());
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setIsPaused(false);
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.code) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePieceHandler();
          break;
        case 'Space':
          event.preventDefault();
          hardDrop();
          break;
        case 'KeyP':
          togglePause();
          break;
        case 'KeyR':
          if (gameOver) {
            restartGame();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePiece, rotatePieceHandler, hardDrop, gameOver]);

  useEffect(() => {
    const interval = setInterval(() => {
      dropPiece();
    }, Math.max(50, 1000 - (level - 1) * 100));

    return () => clearInterval(interval);
  }, [dropPiece, level]);

  const renderBoard = () => {
    const boardWithPiece = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardX = currentPiece.x + x;
          const boardY = currentPiece.y + y;
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            boardWithPiece[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }

    return boardWithPiece.map((row, rowIndex) => (
      <div key={rowIndex} className="tetris-row">
        {row.map((cell, cellIndex) => (
          <div
            key={cellIndex}
            className={`tetris-cell ${cell !== EMPTY_CELL ? `tetris-${cell}` : ''}`}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="tetris-game">
      <div className="tetris-container">
        <div className="tetris-info">
          <h1>テトリス</h1>
          <div className="tetris-stats">
            <div>スコア: {score}</div>
            <div>レベル: {level}</div>
          </div>
          {gameOver && (
            <div className="tetris-game-over">
              <div>ゲームオーバー!</div>
              <button onClick={restartGame} className="tetris-button">
                リスタート (R)
              </button>
            </div>
          )}
          {isPaused && !gameOver && (
            <div className="tetris-paused">一時停止中</div>
          )}
          <div className="tetris-controls">
            <h3>操作方法:</h3>
            <div>←→ : 移動</div>
            <div>↓ : 高速落下</div>
            <div>↑ : 回転</div>
            <div>Space : 即座に落下</div>
            <div>P : 一時停止</div>
            <div>R : リスタート</div>
          </div>
          <button onClick={togglePause} className="tetris-button">
            {isPaused ? '再開' : '一時停止'} (P)
          </button>
        </div>
        <div className="tetris-board">
          {renderBoard()}
        </div>
      </div>
    </div>
  );
};

export default Tetris;