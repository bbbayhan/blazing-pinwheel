import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListView from './pages/ListView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/list" element={<ListView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
