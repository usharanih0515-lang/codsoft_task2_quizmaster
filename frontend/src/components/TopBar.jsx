import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './TopBar.css';

const TopBar = () => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="topbar">
      {/* Search */}
      <div className="topbar-search">
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search quizzes..."
        />
      </div>

      {/* Right side */}
      <div className="topbar-right">
        <span className="topbar-saving">Auto saving...</span>

        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={17} />
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">{initials}</div>
          <span className="topbar-user-name">{user?.name?.split(' ')[0] || 'User'}</span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
};

export default TopBar;
