import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '2rem 1.25rem',
      textAlign: 'center',
      color: '#64748b',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500, color: '#1e293b' }}>
          &copy; 2026 QuizMaster. All rights reserved.
        </p>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          CodSoft Internship Level 2 - Task 2
        </p>
      </div>
    </footer>
  );
};

export default Footer;
