import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Tetris from './tetris/Tetris.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <h1 className="text-4xl font-bold text-blue-600">
              Hello! React
            </h1>
          </div>
        } />
        <Route path="/tetris" element={<Tetris />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;