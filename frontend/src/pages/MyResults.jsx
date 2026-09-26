import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, BookOpen, CheckCircle2, Calendar, User, Clock, Eye } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyResults = () => {
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/quizzes/attempts/my')
      .then((r) => setAttempts(r.data.data || []))
      .catch(() => setError('Failed to load results.'))
      .finally(() => setLoading(false));
  }, []);

  const getScoreColor = (pct) => {
    if (pct >= 80) return { color: '#10b981', bg: '#d1fae5' };
    if (pct >= 50) return { color: '#f59e0b', bg: '#fef3c7' };
    return { color: '#ef4444', bg: '#fee2e2' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  const formatTimeTaken = (startedAt, submittedAt, expiresAt) => {
    if (!startedAt) return '-';
    const start = new Date(startedAt).getTime();
    const end = submittedAt ? new Date(submittedAt).getTime() : (expiresAt ? new Date(expiresAt).getTime() : Date.now());
    const seconds = Math.max(0, Math.floor((end - start) / 1000));
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isTeacher ? 'Teacher Quiz Results' : 'My Quiz Results'}</h1>
        <p className="page-subtitle">
          {isTeacher
            ? 'Track detailed student attempt records and performance across your quizzes.'
            : 'Your complete quiz history and score performance breakdown.'}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ color: 'var(--text-light)', padding: '3rem 0', textAlign: 'center' }}>Loading results...</div>
      ) : attempts.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-state-icon"><Trophy size={28} /></div>
          <h3>{isTeacher ? 'No student attempts recorded yet' : 'No quiz attempts yet'}</h3>
          <p>{isTeacher ? 'Student results will appear here as soon as they complete your quizzes.' : 'You have not taken any quizzes yet.'}</p>
          {!isTeacher && (
            <Link to="/quizzes" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Explore Quizzes
            </Link>
          )}
        </div>
      ) : isTeacher ? (
        /* 10. TEACHER QUIZ RESULTS (Table View) */
        <div className="quiz-table-card">
          <div className="quiz-table-wrapper">
            <table className="quiz-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Taken</th>
                  <th>Submitted At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const quiz = attempt.quiz;
                  const student = attempt.user;
                  const timeTaken = formatTimeTaken(attempt.startedAt, attempt.submittedAt, attempt.expiresAt);
                  const isExpired = attempt.status === 'expired';

                  return (
                    <tr key={attempt._id}>
                      <td style={{ fontWeight: 600 }}>{student?.name || 'Student'}</td>
                      <td style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>{student?.email || '-'}</td>
                      <td className="quiz-title-cell">{quiz?.title || 'Quiz'}</td>
                      <td style={{ fontWeight: 600 }}>{attempt.score} / {attempt.totalQuestions}</td>
                      <td>
                        <span className={`badge ${attempt.percentage >= 75 ? 'badge-success' : attempt.percentage >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                          {attempt.percentage}%
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{timeTaken}</td>
                      <td style={{ fontSize: '0.85rem' }}>{formatDate(attempt.submittedAt || attempt.createdAt)}</td>
                      <td>
                        <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`} style={{ textTransform: 'capitalize' }}>
                          {attempt.status || 'Submitted'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* 6. STUDENT RESULTS (Card List View with detailed breakdown) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {attempts.map((attempt) => {
            const col = getScoreColor(attempt.percentage);
            const quiz = attempt.quiz;
            const answersArray = attempt.answers || [];
            const correctCount = attempt.score;
            const totalQ = attempt.totalQuestions;
            const unansweredCount = answersArray.filter((a) => !a.selectedAnswer).length;
            const incorrectCount = totalQ - correctCount - unansweredCount;
            const timeTaken = formatTimeTaken(attempt.startedAt, attempt.submittedAt, attempt.expiresAt);
            const timeLimit = quiz?.timeLimit || 10;
            const isExpired = attempt.status === 'expired';

            return (
              <div
                key={attempt._id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      {quiz?.title || 'Quiz'}
                    </h3>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>
                      Category: {quiz?.category || 'General'}
                    </span>
                  </div>

                  <span className={`badge ${isExpired ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.8125rem', textTransform: 'capitalize', padding: '0.3rem 0.75rem' }}>
                    Status: {attempt.status || 'Submitted'}
                  </span>
                </div>

                {/* Grid metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Score</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: col.color }}>{attempt.percentage}% ({correctCount}/{totalQ})</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Correct</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#059669' }}>{correctCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Incorrect</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626' }}>{incorrectCount < 0 ? 0 : incorrectCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Unanswered</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#64748b' }}>{unansweredCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Time Taken</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', fontFamily: 'monospace' }}>{timeTaken} / {timeLimit}:00</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>Submitted</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>{formatDate(attempt.submittedAt || attempt.createdAt)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  {quiz?._id && (
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
                      onClick={() => navigate(`/quizzes/${quiz._id}/take`)}
                    >
                      Retake Quiz
                    </button>
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

export default MyResults;
