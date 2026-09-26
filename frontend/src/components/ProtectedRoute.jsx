import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute — only allows authenticated users.
 * Unauthenticated users are sent to /login.
 * The original location is preserved in `state.from` so
 * Login can redirect back after successful authentication.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

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

  if (!user) {
    // Save where the user was trying to go so Login can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
