import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, HelpCircle, Check, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './TakeQuiz.css';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Confirmation screen state
  const [startConfirmed, setStartConfirmed] = useState(false);
  const [startingAttempt, setStartingAttempt] = useState(false);
  
  // Question & Answers state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  
  // Submit modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Use ref to hold latest answers for auto-submit
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Load quiz metadata on mount
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const qRes = await api.get(`/quizzes/${id}`);
        const qData = qRes.data.data;
        setQuiz(qData);

        // Check if student already has an active or submitted attempt
        try {
          const aRes = await api.post(`/quizzes/${id}/start`);
          const attemptData = aRes.data.data;
          
          if (attemptData) {
            setAttempt(attemptData);

            if (attemptData.status === 'expired' || attemptData.status === 'submitted') {
              setError(`This attempt has already been ${attemptData.status}.`);
              return;
            }

            // Hydrate saved answers if resuming active attempt
            if (attemptData.answers && Array.isArray(attemptData.answers)) {
              const restored = {};
              attemptData.answers.forEach((a) => {
                if (a.questionId && a.selectedAnswer) {
                  restored[a.questionId] = a.selectedAnswer;
                }
              });
              setAnswers(restored);
            }

            // Student already had an active attempt in progress -> resume directly
            setStartConfirmed(true);
          }
        } catch {
          // No active attempt started yet — show start confirmation modal/screen
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // Timer interval hook
  useEffect(() => {
    if (!startConfirmed || !attempt || attempt.status !== 'in_progress') return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const expiresAt = new Date(attempt.expiresAt);
      const diff = Math.floor((expiresAt - now) / 1000);
      
      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        handleAutoSubmit();
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [attempt, startConfirmed]);

  // Start Quiz handler (Server attempt starts ONLY when student confirms)
  const handleConfirmStart = async () => {
    setStartingAttempt(true);
    setError('');
    try {
      const res = await api.post(`/quizzes/${id}/start`);
      const attemptData = res.data.data;
      setAttempt(attemptData);

      if (attemptData.answers && Array.isArray(attemptData.answers)) {
        const restored = {};
        attemptData.answers.forEach((a) => {
          if (a.questionId && a.selectedAnswer) {
            restored[a.questionId] = a.selectedAnswer;
          }
        });
        setAnswers(restored);
      }

      setStartConfirmed(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start quiz attempt.');
    } finally {
      setStartingAttempt(false);
    }
  };

  // Option selection with backend auto-save
  const handleSelect = async (questionId, optionText) => {
    const updated = { ...answers, [questionId]: optionText };
    setAnswers(updated);
    setSubmitError('');

    // Auto-save to backend active attempt
    if (attempt && attempt._id) {
      try {
        await api.post(`/quizzes/${id}/save-answers`, {
          attemptId: attempt._id,
          answers: updated
        });
      } catch (e) {
        console.warn('Auto-save sync warning:', e);
      }
    }
  };

  // Submit to API function
  const submitToApi = async (isAuto) => {
    setSubmitting(true);
    setShowSubmitModal(false);
    try {
      const payload = {
        attemptId: attempt._id,
        answers: Object.entries(answersRef.current).map(([questionId, selectedAnswer]) => ({
          questionId,
          selectedAnswer,
        })),
      };
      const res = await api.post(`/quizzes/${id}/submit`, payload);
      navigate(`/quizzes/${id}/results`, {
        state: { results: res.data.data, quizTitle: quiz.title, autoSubmitted: isAuto },
      });
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  // Auto-submit when timer expires
  const handleAutoSubmit = () => {
    alert("Time is up. Your quiz was submitted automatically.");
    submitToApi(true);
  };

  // Manual submit trigger -> opens confirmation modal
  const openSubmitConfirmation = () => {
    setShowSubmitModal(true);
  };

  if (loading) return <div className="take-quiz-loading">Loading quiz...</div>;

  if (error) return (
    <div className="take-quiz-error" style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-primary" onClick={() => navigate('/my-results')} style={{ marginTop: '1rem', display: 'inline-flex' }}>
        Go to My Results
      </button>
    </div>
  );

  if (!quiz) return null;

  // 1. QUIZ START CONFIRMATION SCREEN (Before quiz attempt starts)
  if (!startConfirmed) {
    return (
      <div style={{ maxWidth: 650, margin: '2rem auto' }}>
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <HelpCircle size={32} />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Ready to start?
          </h1>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.5rem' }}>
            {quiz.title}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>Questions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{quiz.questions?.length || 0}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>Time Limit</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{quiz.timeLimit || 10} minutes</div>
            </div>
          </div>

          <div className="alert alert-warning" style={{ textAlign: 'left', marginBottom: '2rem', fontSize: '0.875rem' }}>
            ⚠ <strong>Important:</strong> Once you start, the timer will begin and cannot be paused.
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', height: '48px' }} onClick={() => navigate('/quizzes')}>
              Cancel
            </button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', height: '48px' }} onClick={handleConfirmStart} disabled={startingAttempt}>
              {startingAttempt ? 'Starting...' : 'Start Quiz'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz calculations
  const total = quiz.questions.length;
  const current = quiz.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = total - answeredCount;
  const progress = Math.round((answeredCount / total) * 100);
  const isLastQuestion = currentIndex === total - 1;

  // Format timer
  let timerClass = "timer-normal";
  if (timeLeft !== null) {
    if (timeLeft <= 10) timerClass = "timer-critical";
    else if (timeLeft <= 60) timerClass = "timer-danger";
    else if (timeLeft <= 300) timerClass = "timer-warning";
  }

  const formatTime = (seconds) => {
    if (seconds === null || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="take-quiz-container">
      {isTeacher && (
        <div className="alert alert-warning" style={{ marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
          🧪 <strong>Teacher Test Mode:</strong> You are testing your quiz timer ({quiz.timeLimit || 10} min limit).
        </div>
      )}

      {/* Header */}
      <div className="take-quiz-header" style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="take-quiz-title">{quiz.title}</h1>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>
              Category: {quiz.category} • Difficulty: {quiz.difficulty}
            </span>
          </div>
          
          {timeLeft !== null && (
            <div className={`quiz-timer ${timerClass}`} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: timerClass === 'timer-critical' ? 'white' : 'var(--text-light)' }}>Time Remaining</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace' }}>{formatTime(timeLeft)}</div>
            </div>
          )}
        </div>

        <div className="quiz-progress-info" style={{ marginTop: '1rem' }}>
          <span className="quiz-progress-label">Question {currentIndex + 1} of {total}</span>
          <span className="quiz-progress-count">{progress}% Complete</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 2. QUESTION NAVIGATOR (Showing every question status) */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>Questions Navigator</span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)' }}>
            Answered: {answeredCount} / {total}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {quiz.questions.map((q, i) => {
            const isAnswered = !!answers[q._id];
            const isCurrent = i === currentIndex;
            return (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                style={{
                  minWidth: '40px',
                  height: '40px',
                  padding: '0 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: isCurrent ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                  background: isCurrent
                    ? 'var(--primary-light)'
                    : isAnswered
                    ? '#d1fae5'
                    : '#f8fafc',
                  color: isCurrent
                    ? 'var(--primary)'
                    : isAnswered
                    ? '#059669'
                    : 'var(--text-main)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  transition: 'all 0.2s'
                }}
                title={`Question ${i + 1} (${isAnswered ? 'Answered' : 'Unanswered'})`}
              >
                {i + 1} {isAnswered && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question panel */}
      <div className="question-panel card">
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Question {currentIndex + 1}
        </div>
        <h2 className="question-text">{current.questionText}</h2>
        <div className="options-list">
          {current.options.map((opt, idx) => {
            const isSelected = answers[current._id] === opt.text;
            return (
              <button
                key={idx}
                className={`option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(current._id, opt.text)}
              >
                <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          ⚠ {submitError}
        </div>
      )}

      {/* Navigation panel */}
      <div className="navigation-panel">
        <button
          className="btn btn-outline"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>
          {answeredCount} of {total} answered
        </div>

        {!isLastQuestion ? (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={openSubmitConfirmation}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* 4. SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Submit Quiz?
            </h2>

            {unansweredCount > 0 ? (
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                You have answered <strong>{answeredCount}</strong> of <strong>{total}</strong> questions.<br />
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{unansweredCount} question(s) unanswered.</span><br />
                Your quiz will be submitted and cannot be changed afterward.
              </p>
            ) : (
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                You answered all <strong>{total}</strong> questions.<br />
                Submit your quiz now?
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowSubmitModal(false)} disabled={submitting}>
                Continue Quiz
              </button>
              <button className="btn btn-primary" onClick={() => submitToApi(false)} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
