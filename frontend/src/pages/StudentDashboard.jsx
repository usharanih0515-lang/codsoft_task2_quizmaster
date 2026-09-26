import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Clock, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizRes, attemptRes] = await Promise.all([
          api.get('/quizzes'),
          api.get('/quizzes/attempts/my')
        ]);
        setQuizzes(quizRes.data.data || []);
        setAttempts(attemptRes.data.data || []);
      } catch {
        setQuizzes([]);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const attemptedIds = new Set(attempts.map(a => a.quiz?._id));
  const completedCount = attemptedIds.size;
  const pendingCount = quizzes.filter(q => !attemptedIds.has(q._id)).length;

  const stats = [
    { label: 'Assigned Quizzes', value: quizzes.length, icon: BookOpen, color: 'blue' },
    { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'green' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'orange' },
    { label: 'Total Attempts', value: attempts.length, icon: Trophy, color: 'purple' },
  ];

  const getDiffBadge = (diff) => {
    if (diff === 'Easy') return 'badge badge-success';
    if (diff === 'Medium') return 'badge badge-warning';
    return 'badge badge-danger';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here are your assigned quizzes and your progress.</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        {stats.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-header">
              <span className="stat-card-label">{s.label}</span>
              <div className={`stat-card-icon ${s.color}`}>
                <s.icon size={18} />
              </div>
            </div>
            <div className="stat-card-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Assigned Quizzes */}
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">My Assigned Quizzes</h2>
      </div>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)' }}>Loading your quizzes...</div>
      ) : quizzes.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <BookOpen size={48} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
          <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>No quizzes yet</h3>
          <p style={{ color: 'var(--text-light)' }}>Your teacher hasn't assigned any quizzes yet. Check back later.</p>
        </div>
      ) : (
        <div className="quiz-table-card">
          <div className="quiz-table-wrapper">
            <table className="quiz-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => {
                  const attempted = attemptedIds.has(quiz._id);
                  return (
                    <tr key={quiz._id}>
                      <td className="quiz-title-cell">{quiz.title}</td>
                      <td>{quiz.category}</td>
                      <td>
                        <span className={getDiffBadge(quiz.difficulty)}>{quiz.difficulty}</span>
                      </td>
                      <td>
                        <span className={`badge ${attempted ? 'badge-success' : 'badge-warning'}`}>
                          {attempted ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <Link
                          to={`/quizzes/${quiz._id}/take`}
                          className="btn btn-primary"
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.8125rem' }}
                        >
                          {attempted ? 'Retake' : 'Start Quiz'}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
