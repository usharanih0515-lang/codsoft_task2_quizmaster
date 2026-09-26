import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your profile and account preferences.</p>
      </div>

      {/* Profile */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
          Profile
        </h2>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-control"
              value={email}
              disabled
              style={{ background: 'var(--background)', cursor: 'not-allowed' }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              Email cannot be changed.
            </small>
          </div>
          {saved && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              ✓ Changes saved successfully.
            </div>
          )}
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Appearance
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9375rem' }}>
          Theme customization coming soon.
        </p>
      </div>
    </div>
  );
};

export default Settings;
