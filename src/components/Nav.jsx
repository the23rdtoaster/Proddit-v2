import { ROLES } from '../data/mockData';
import { useApp } from '../context/AppContext';

const navItems = [
  { key: 'dashboard',  label: 'Squad',      icon: '🌍' },
  { key: 'profile',    label: 'Profile',    icon: '🌿' },
  { key: 'checkin',    label: 'Check-In',   icon: '📷' },
  { key: 'forum',      label: 'Forum',      icon: '💬' },
  { key: 'inventory',  label: 'Inventory',  icon: '🎒' },
  { key: 'shop',       label: 'Eco Shop',   icon: '🛒' },
  { key: 'trade',      label: 'Trade Hub',  icon: '🔄' },
  { key: 'leaderboard',label: 'Leaderboard',icon: '🏆' },
  { key: 'assistant',  label: 'AI Assistant',icon: '🤖' },
];

export default function Nav({ page, onNavigate }) {
  const { user } = useApp();
  const roleInfo = ROLES[user.role];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🌱</div>
        <span className="sidebar-logo-text">Proddit</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={`nav-item ${page === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.username[0].toUpperCase()}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">@{user.username}</div>
            <div className="sidebar-user-role">{roleInfo?.icon} {user.role.charAt(0).toUpperCase() + user.role.slice(1)} · Lv {user.level}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
