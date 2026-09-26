import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const TeacherRoute = () => {
  const { user, loading, isTeacher } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  if (!isTeacher) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
};

export default TeacherRoute;
