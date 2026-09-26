import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Key, RefreshCw } from 'lucide-react';
import api from '../services/api';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add Student Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
  const [addLoading, setAddLoading] = useState(false);
  
  // Temp credentials display
  const [tempCreds, setTempCreds] = useState(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/students');
      setStudents(res.data.data);
    } catch (err) {
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setTempCreds(null);
    try {
      await api.post('/users/students', newStudent);
      setTempCreds(newStudent);
      setNewStudent({ name: '', email: '', password: '' });
      setShowAddForm(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add student');
    } finally {
      setAddLoading(false);
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPassword = prompt(`Enter new temporary password for ${name}:`);
    if (!newPassword) return;

    try {
      await api.put(`/users/students/${id}/reset-password`, { password: newPassword });
      alert(`Password for ${name} reset successfully to: ${newPassword}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your class?`)) return;
    try {
      await api.delete(`/users/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>My Students</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={18} /> {showAddForm ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {tempCreds && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
          <strong>Student Added Successfully!</strong><br />
          Please provide these credentials to the student:<br/>
          Email: <strong>{tempCreds.email}</strong><br/>
          Password: <strong>{tempCreds.password}</strong><br/>
          <em>(They will be forced to change this upon first login)</em>
          <button onClick={() => setTempCreds(null)} style={{ marginLeft: '1rem', background: 'transparent', border: 'none', color: '#166534', cursor: 'pointer', textDecoration: 'underline' }}>Dismiss</button>
        </div>
      )}

      {showAddForm && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Create New Student Account</h2>
          <form onSubmit={handleAddStudent} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Full Name</label>
              <input className="form-control" required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="e.g. Jane Doe" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Email</label>
              <input className="form-control" type="email" required value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} placeholder="student@school.com" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Temporary Password</label>
              <input className="form-control" required value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} placeholder="Temp password" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={addLoading} style={{ height: 42 }}>
              {addLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
      )}

      {students.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-light)' }}>
          <UserPlus size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
          <h3>No students yet</h3>
          <p>Click "Add Student" to create accounts for your class.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Name</th>
                <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>Email</th>
                <th style={{ padding: '1rem', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>{student.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-light)' }}>{student.email}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleResetPassword(student._id, student.name)}
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Reset Password"
                      >
                        <Key size={14} /> Reset
                      </button>
                      <button 
                        onClick={() => handleDelete(student._id, student.name)}
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', borderColor: '#fee2e2', background: '#fef2f2' }}
                        title="Remove Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
