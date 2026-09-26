import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = (
    <>
      <Link
        to="/quizzes"
        className={`nav-link ${isActive('/quizzes') ? 'nav-link--active' : ''}`}
        onClick={() => setMenuOpen(false)}
      >
        Quizzes
      </Link>
      {user ? (
        <>
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'nav-link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'nav-link--active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/create-quiz"
            className="btn btn-outline nav-btn"
            onClick={() => setMenuOpen(false)}
          >
            + Create Quiz
          </Link>
          <button onClick={handleLogout} className="btn btn-primary nav-btn">Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
          <Link to="/register" className="btn btn-primary nav-btn" onClick={() => setMenuOpen(false)}>Register</Link>
        </>
      )}
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">⚡</span>QuizMaster
        </Link>

        {/* Desktop links */}
        <div className="navbar-links desktop-links">
          {navLinks}
        </div>

        {/* Mobile hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
