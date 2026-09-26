import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LayoutDashboard, Trophy, ChevronRight, Plus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user, isTeacher } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes')
      .then((r) => setQuizzes(r.data.data?.slice(0, 3) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getDiff = (d) => {
    if (d === 'Easy') return { bg: '#d1fae5', color: '#059669' };
    if (d === 'Medium') return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#fee2e2', color: '#dc2626' };
  };

  const studentActions = [
    { icon: BookOpen, label: 'Explore Quizzes', sub: 'Browse and take published quizzes', to: '/quizzes', color: '#eff6ff', iconColor: '#3b82f6' },
    { icon: Trophy, label: 'My Results', sub: 'View your quiz history', to: '/my-results', color: '#f0fdf4', iconColor: '#16a34a' },
  ];

  const creatorActions = [
    { icon: Plus, label: 'Create Quiz', sub: 'Build a new quiz', to: '/create-quiz', color: '#faf5ff', iconColor: '#9333ea' },
    { icon: LayoutDashboard, label: 'Dashboard', sub: 'Manage your quizzes', to: '/dashboard', color: '#fff7ed', iconColor: '#ea580c' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.9375rem' }}>
          Create quizzes, explore content, and track your results from one place.
        </p>
      </div>

      {/* Student Quick Actions */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
          Take a Quiz
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {studentActions.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: 'white',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.125rem 1.25rem',
                boxShadow: 'var(--shadow-card)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
            >
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.color, color: a.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <a.icon size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>{a.label}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>{a.sub}</div>
              </div>
              <ChevronRight size={16} color="var(--border-dark)" style={{ marginLeft: 'auto' }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Creator Quick Actions */}
      {isTeacher && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
            Manage Quizzes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
            {creatorActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.125rem 1.25rem',
                  boxShadow: 'var(--shadow-card)',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: a.color, color: a.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <a.icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>{a.label}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>{a.sub}</div>
                </div>
                <ChevronRight size={16} color="var(--border-dark)" style={{ marginLeft: 'auto' }} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Featured Quizzes */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Featured Quizzes</h2>
          <Link to="/quizzes" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>View All</Link>
        </div>

        {loading ? (
          <div style={{ color: 'var(--text-light)', padding: '1rem 0' }}>Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon"><BookOpen size={28} /></div>
            <h3>No quizzes yet</h3>
            <p>Check back later for new content!</p>
            {isTeacher && (
              <Link to="/create-quiz" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Create Quiz</Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {quizzes.map((quiz) => {
              const badge = getDiff(quiz.difficulty);
              return (
                <div key={quiz._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.375rem' }}>{quiz.title}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {quiz.description}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>{quiz.questions?.length || 0} questions</span>
                    <span style={{ padding: '0.2rem 0.625rem', borderRadius: 9999, fontWeight: 600, fontSize: '0.75rem', background: badge.bg, color: badge.color }}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  <Link to={`/quizzes/${quiz._id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    View Quiz <ChevronRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
