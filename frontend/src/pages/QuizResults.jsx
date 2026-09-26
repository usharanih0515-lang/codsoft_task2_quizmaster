import React from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, HelpCircle, ArrowLeft, RotateCcw, LayoutDashboard, Home, Clock, Calendar } from 'lucide-react';
import './QuizResults.css';

const QuizResults = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { results, quizTitle, autoSubmitted } = location.state || {};

  if (!results) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>No results to display.</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
          It looks like you haven't taken this quiz yet or refreshed the results page.
        </p>
        <Link to="/my-results" className="btn btn-primary">Go to My Results</Link>
      </div>
    );
  }

  const { score, totalQuestions, percentage, incorrectAnswers, status } = results;
  const unansweredCount = results.results ? results.results.filter(r => !r.selectedAnswer).length : 0;
  const attemptedCount = totalQuestions - unansweredCount;

  const getColor = () => {
    if (percentage >= 80) return 'var(--success)';
    if (percentage >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };

  const getLabel = () => {
    if (status === 'expired' || autoSubmitted) return '⏱ Time Expired';
    if (percentage >= 80) return '🎉 Excellent!';
    if (percentage >= 60) return '👍 Good Job!';
    if (percentage >= 40) return '📚 Keep Practicing!';
    return '💡 Better Luck Next Time!';
  };

  const color = getColor();

  const formatDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  return (
    <div className="results-container">
      {autoSubmitted && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.95rem' }}>
          ⏱ <strong>Time is up. Your quiz was submitted automatically.</strong>
        </div>
      )}

      {/* Score summary card */}
      <div className="results-header card">
        <h1 className="results-title">{quizTitle || 'Quiz Summary'}</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <span className={`badge ${status === 'expired' ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.875rem', padding: '0.35rem 0.875rem', textTransform: 'capitalize' }}>
            Status: {status || 'Submitted'}
          </span>
          <span className="badge badge-primary" style={{ fontSize: '0.875rem', padding: '0.35rem 0.875rem' }}>
            Submitted: {formatDate()}
          </span>
        </div>

        <div className="score-circle-wrapper">
          <div className="score-circle" style={{ borderColor: color }}>
            <span className="score-number" style={{ color }}>{percentage}%</span>
            <span className="score-total">{score} / {totalQuestions}</span>
          </div>
        </div>

        <p className="score-label" style={{ marginTop: '1rem', fontWeight: 700, fontSize: '1.125rem' }}>{getLabel()}</p>

        {/* Professional summary stats */}
        <div className="stats-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', marginTop: '1.5rem' }}>
          <div className="stat-item correct">
            <span className="stat-num">{score}</span>
            <span className="stat-label">Correct</span>
          </div>
          <div className="stat-item incorrect">
            <span className="stat-num">{incorrectAnswers}</span>
            <span className="stat-label">Incorrect</span>
          </div>
          <div className="stat-item" style={{ background: '#f1f5f9', color: '#475569' }}>
            <span className="stat-num">{unansweredCount}</span>
            <span className="stat-label">Unanswered</span>
          </div>
          <div className="stat-item total">
            <span className="stat-num">{totalQuestions}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* Question-by-question review */}
      <h2 className="review-heading" style={{ marginTop: '2rem' }}>Question-by-Question Review</h2>

      <div className="review-list">
        {results.results && results.results.map((r, i) => {
          const isUnanswered = !r.selectedAnswer;
          let badgeClass = 'badge-incorrect';
          let cardClass = 'incorrect-card';
          let statusText = 'Incorrect';
          let StatusIcon = XCircle;

          if (r.isCorrect) {
            badgeClass = 'badge-correct';
            cardClass = 'correct-card';
            statusText = 'Correct';
            StatusIcon = CheckCircle2;
          } else if (isUnanswered) {
            badgeClass = 'badge-warning';
            cardClass = '';
            statusText = 'Unanswered';
            StatusIcon = HelpCircle;
          }

          return (
            <div key={i} className={`review-card card ${cardClass}`}>
              <div className="review-card-header">
                <span className="question-num">Question {i + 1}</span>
                <span className={`result-badge ${badgeClass}`}>
                  <StatusIcon size={14} /> {statusText}
                </span>
              </div>
              
              <p className="review-question">{r.questionText}</p>
              
              <div className="review-answers">
                <div className={`answer-row ${r.isCorrect ? 'answer-correct' : isUnanswered ? '' : 'answer-wrong'}`}>
                  <span className="answer-label">Your Answer:</span>
                  <span className="answer-value">{r.selectedAnswer || <em style={{ color: 'var(--text-light)' }}>Not answered</em>}</span>
                </div>
                
                {!r.isCorrect && (
                  <div className="answer-row answer-correct">
                    <span className="answer-label">Correct Answer:</span>
                    <span className="answer-value">{r.correctAnswer}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="results-actions" style={{ marginTop: '2rem' }}>
        <button className="btn btn-outline" onClick={() => navigate(`/quizzes/${id}/take`)}>
          <RotateCcw size={16} /> Retake Quiz
        </button>
        <Link to="/quizzes" className="btn btn-outline">
          <ArrowLeft size={16} /> Explore Quizzes
        </Link>
        <Link to="/my-results" className="btn btn-primary">
          <LayoutDashboard size={16} /> My Results
        </Link>
      </div>
    </div>
  );
};

export default QuizResults;
