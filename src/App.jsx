import { useState, Component } from 'react';
import { AppProvider } from './context/AppContext';
import Nav from './components/Nav';
import Onboarding from './pages/Onboarding';
import SquadSetup from './pages/SquadSetup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CheckIn from './pages/CheckIn';
import Forum from './pages/Forum';
import Inventory from './pages/Inventory';
import Shop from './pages/Shop';
import TradeHub from './pages/TradeHub';
import Leaderboard from './pages/Leaderboard';
import AIAssistant from './pages/AIAssistant';
import { useApp } from './context/AppContext';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, background: '#1A2B1A', borderRadius: 12, margin: 20, border: '1px solid #2A3D2A' }}>
          <div style={{ fontWeight: 800, color: '#FF3B30', marginBottom: 8 }}>⚠️ Component Error</div>
          <pre style={{ fontSize: 12, color: '#aaa', whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0D1A0D', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🌱</div>
      <div style={{ color: '#4CAF50', fontWeight: 700, fontSize: 18 }}>Loading Proddit…</div>
      <div style={{ color: '#666', fontSize: 13 }}>Connecting to your conservation hub</div>
    </div>
  );
}

function AppInner() {
  const { authed, onboarded, squad, loading } = useApp();
  const [page, setPage] = useState('dashboard');

  if (loading) return <LoadingScreen />;
  if (!authed) return <Onboarding />;
  if (authed && !onboarded) return <Onboarding />;
  if (authed && onboarded && !squad) return <SquadSetup onComplete={() => setPage('dashboard')} />;

  const pages = {
    dashboard:   <Dashboard onNavigate={setPage} />,
    profile:     <ErrorBoundary><Profile /></ErrorBoundary>,
    checkin:     <CheckIn />,
    forum:       <Forum />,
    inventory:   <Inventory />,
    shop:        <Shop />,
    trade:       <TradeHub />,
    leaderboard: <Leaderboard />,
    assistant:   <AIAssistant />,
  };

  return (
    <div className="app-layout">
      <Nav page={page} onNavigate={setPage} />
      <main className="main-content">
        {pages[page] || pages.dashboard}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
