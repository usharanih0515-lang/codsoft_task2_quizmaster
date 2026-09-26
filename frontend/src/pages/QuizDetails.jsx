import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, CheckCircle, Clock, BarChart2, Pencil, Trash2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const QuizDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then((r) => setQuiz(r.data.data))
      .catch(() => setError('Quiz not found or could not be loaded.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = isTeacher && quiz?.createdBy?._id === user?.id;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/quizzes/${id}`);
      navigate('/dashboard');
    } catch {
      alert('Failed to delete quiz.');
      setDeleting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>Loading quiz...</div>;
  if (error) return (
    <div style={{ maxWidth: 600, margin: '2rem auto', textAlign: 'center' }}>
      <div className="alert alert-error">{error}</div>
      <Link to="/quizzes" className="btn btn-outline" style={{ marginTop: '1rem' }}>Back to Quizzes</Link>
    </div>
  );
  if (!quiz) return null;

  const getDiff = () => {
    if (quiz.difficulty === 'Easy') return { bg: '#d1fae5', color: '#059669' };
    if (quiz.difficulty === 'Medium') return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#fee2e2', color: '#dc2626' };
  };
  const badge = getDiff();

  const metaItems = [
    { icon: CheckCircle, label: 'Questions', value: quiz.questions?.length || 0 },
    { icon: BookOpen, label: 'Category', value: quiz.category },
    { icon: BarChart2, label: 'Difficulty', value: quiz.difficulty },
    { icon: Clock, label: 'Time Limit', value: quiz.timeLimit ? `${quiz.timeLimit} min` : 'No limit' },
    { icon: User, label: 'Created By', value: quiz.createdBy?.name || 'Unknown' },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{quiz.title}</h1>
          <span style={{ padding: '0.3rem 1rem', borderRadius: 9999, fontWeight: 700, fontSize: '0.875rem', background: badge.bg, color: badge.color, flexShrink: 0 }}>
            {quiz.difficulty}
          </span>
        </div>

        <p style={{ color: 'var(--text-light)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {quiz.description}
        </p>

        {/* Meta grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {metaItems.map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: 'var(--background)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Teacher owner actions */}
        {isOwner && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#9a3412' }}>You created this quiz</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/edit-quiz/${id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', fontSize: '0.875rem' }}
              >
                <Pencil size={15} /> Edit Quiz
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', fontSize: '0.875rem', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}
              >
                <Trash2 size={15} /> {deleting ? 'Deleting...' : 'Delete Quiz'}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/quizzes/${id}/take`)}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: 'center', height: '48px', fontSize: '1rem' }}
          >
            {isTeacher ? '⏱ Test Quiz & Timer' : 'Start Quiz'}
          </button>
          <Link to="/quizzes" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', height: '48px', fontSize: '1rem' }}>
            Back to Quizzes
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
