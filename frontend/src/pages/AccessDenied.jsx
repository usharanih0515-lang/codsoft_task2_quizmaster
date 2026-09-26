import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import '../App.css';

const AccessDenied = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-color)', padding: '2rem', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '440px', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--danger)' }}>
          <ShieldAlert size={64} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Access Denied
        </h1>
        <p style={{ color: 'var(--text-light)', lineHeight: 1.6, marginBottom: '2rem' }}>
          Quiz creation and management are available only to teacher accounts. 
          If you believe you should have access, please contact administration.
        </p>
        <Link to="/quizzes" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '48px' }}>
          Browse Quizzes
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied;
