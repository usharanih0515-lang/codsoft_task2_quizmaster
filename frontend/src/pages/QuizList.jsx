import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const [search, setSearch] = useState(queryParams.get('search') || '');
  const [category, setCategory] = useState(queryParams.get('category') || '');
  const [difficulty, setDifficulty] = useState(queryParams.get('difficulty') || '');

  const fetchQuizzesAndAttempts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (difficulty) params.append('difficulty', difficulty);
      
      const [qRes, aRes] = await Promise.allSettled([
        api.get(`/quizzes?${params.toString()}`),
        api.get('/quizzes/attempts/my')
      ]);

      if (qRes.status === 'fulfilled') {
        setQuizzes(qRes.value.data.data || []);
      }
      if (aRes.status === 'fulfilled') {
        setAttempts(aRes.value.data.data || []);
      }
      setError('');
    } catch {
      setError('Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzesAndAttempts();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    navigate(`/quizzes?${params.toString()}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, difficulty]);

  const getDiff = (d) => {
    if (d === 'Easy') return { bg: '#d1fae5', color: '#059669' };
    if (d === 'Medium') return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#fee2e2', color: '#dc2626' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: 'numeric' });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Explore Quizzes</h1>
        <p className="page-subtitle">Choose an assigned quiz and test your knowledge.</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search quizzes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Category</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Programming"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Difficulty</label>
            <select
              className="form-control"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>Loading quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><BookOpen size={28} /></div>
          <h3>No quizzes found</h3>
          <p>Try adjusting your search filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {quizzes.map((quiz) => {
            const badge = getDiff(quiz.difficulty);
            const now = new Date();
            
            const isNotYetAvailable = quiz.availableFrom && now < new Date(quiz.availableFrom);
            const isExpiredWindow = quiz.availableUntil && now > new Date(quiz.availableUntil);
            
            const existingAttempt = attempts.find((a) => a.quiz && (a.quiz._id === quiz._id || a.quiz === quiz._id));
            const isCompleted = existingAttempt && (existingAttempt.status === 'submitted' || existingAttempt.status === 'expired');

            return (
              <div key={quiz._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.375rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {quiz.title}
                    </h3>
                    <span style={{ padding: '0.2rem 0.625rem', borderRadius: 9999, fontWeight: 700, background: badge.bg, color: badge.color, fontSize: '0.75rem', flexShrink: 0 }}>
                      {quiz.difficulty}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {quiz.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-light)', flexWrap: 'wrap' }}>
                  <span>{quiz.questions?.length || 0} Questions</span>
                  <span><Clock size={13} style={{ verticalAlign: '-1px' }} /> {quiz.timeLimit || 10} Minutes</span>
                </div>

                {/* Scheduling Info */}
                {(quiz.availableFrom || quiz.availableUntil) && (
                  <div style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                    <Calendar size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                    {isNotYetAvailable ? (
                      <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Available: {formatDate(quiz.availableFrom)}</span>
                    ) : isExpiredWindow ? (
                      <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Expired on {formatDate(quiz.availableUntil)}</span>
                    ) : (
                      <span>Available until {formatDate(quiz.availableUntil)}</span>
                    )}
                  </div>
                )}

                {/* Action buttons based on status */}
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  {isCompleted ? (
                    <Link to="/my-results" className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
                      <CheckCircle2 size={15} /> View Result
                    </Link>
                  ) : isNotYetAvailable ? (
                    <button className="btn btn-outline" disabled style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed', justifyContent: 'center' }}>
                      Not Available Yet
                    </button>
                  ) : isExpiredWindow ? (
                    <button className="btn btn-outline" disabled style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed', justifyContent: 'center' }}>
                      Quiz Closed
                    </button>
                  ) : (
                    <Link to={`/quizzes/${quiz._id}/take`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Start Quiz
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizList;
