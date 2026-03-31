import { HashRouter, Routes, Route } from 'react-router-dom';
import TimerPage from './pages/TimerPage';
import AnalysisPage from './pages/AnalysisPage';
import SettingsPage from './pages/SettingsPage';
import Navbar from './components/Navbar';
import './App.css';

export default function App() {
  return (
    <HashRouter>
      <div className="app-shell">
        <div className="app-content">
          <Routes>
            <Route path="/" element={<TimerPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
        <Navbar />
      </div>
    </HashRouter>
  );
}
