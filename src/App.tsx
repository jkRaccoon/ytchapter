import { Route, Routes } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Guide from './pages/Guide';
import Faq from './pages/Faq';

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/faq" element={<Faq />} />
      </Route>
    </Routes>
  );
}
