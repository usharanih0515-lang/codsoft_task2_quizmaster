import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PublicRoute — only accessible to unauthenticated users.
 * Authenticated users are sent to / (Home).
 */
const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-color)',
        flexDirection: 'column',
        gap: '1rem',
        color: 'var(--text-light)',
        fontSize: '1.125rem',
        fontFamily: 'Inter, sans-serif',
      }}>
        <span style={{ fontSize: '2rem' }}>⚡</span>
        Loading QuizMaster...
      </div>
    );
  }

  // Already logged in — send to Home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
