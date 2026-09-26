import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  Home,
  Trophy,
  Plus,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">⚡</span>
          <span className="sidebar-logo-text">QuizMaster</span>
        </div>

        <nav className="sidebar-nav">
          {isTeacher ? (
            <>
              <span className="nav-section-label">Teacher</span>
              <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <LayoutDashboard size={18} className="sidebar-icon" /> Dashboard
              </NavLink>
              <NavLink to="/students" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <Users size={18} className="sidebar-icon" /> My Students
              </NavLink>
              <NavLink to="/create-quiz" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <Plus size={18} className="sidebar-icon" /> Create Quiz
              </NavLink>
              <NavLink to="/my-results" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <Trophy size={18} className="sidebar-icon" /> Quiz Results
              </NavLink>
            </>
          ) : (
            <>
              <span className="nav-section-label">Student</span>
              <NavLink to="/student-dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <Home size={18} className="sidebar-icon" /> My Dashboard
              </NavLink>
              <NavLink to="/quizzes" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <BookOpen size={18} className="sidebar-icon" /> My Quizzes
              </NavLink>
              <NavLink to="/my-results" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
                <Trophy size={18} className="sidebar-icon" /> My Results
              </NavLink>
            </>
          )}

          <span className="nav-section-label" style={{ marginTop: '0.75rem' }}>Account</span>
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
            <Settings size={18} className="sidebar-icon" /> Settings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role" style={{ 
                textTransform: 'uppercase', 
                fontSize: '0.65rem', 
                fontWeight: 'bold', 
                padding: '0.1rem 0.3rem', 
                background: isTeacher ? 'var(--primary-light)' : '#f0fdf4',
                color: isTeacher ? 'var(--primary)' : '#16a34a',
                borderRadius: '4px',
                display: 'inline-block',
                marginTop: '0.2rem'
              }}>
                {isTeacher ? 'TEACHER' : 'STUDENT'}
              </div>
            </div>
          </div>
          <button className="sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
