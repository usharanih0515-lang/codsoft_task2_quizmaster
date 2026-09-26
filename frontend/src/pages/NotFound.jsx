import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--primary-color)', margin: 0 }}>404</h1>
      <h2 style={{ color: 'var(--text-main)', marginBottom: '1.5rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">Go to Home</Link>
    </div>
  );
};

export default NotFound;
