import { Routes, Route } from 'react-router-dom';
import { NavbarSimple } from './components/NavbarSimple';
import HomePage from './pages/HomePage';
import PdfDisplayPage from './pages/PdfDisplayPage';

function App() {
  return (
    <>
      <NavbarSimple />
      <Routes>
        <Route index element={<HomePage />} />
        <Route path='/displaypdf' element={<PdfDisplayPage />} />
      </Routes>
    </>
  );
}

export default App;
