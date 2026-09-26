import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Send, Check } from 'lucide-react';
import api from '../services/api';
import './CreateQuiz.css';

const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F'];

const defaultQuestion = () => ({
  questionText: '',
  options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
  correctAnswer: '',
  _correctIndex: null,
});

/* ── Main Component ───────────────────────────────────────── */
const CreateQuiz = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');

  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Easy',
    timeLimit: '',
    availableFrom: '',
    availableUntil: '',
    isPublished: false,
  });
  
  const [questions, setQuestions] = useState([defaultQuestion()]);
  const [myStudents, setMyStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);

  /* Load existing quiz on edit & fetch students */
  useEffect(() => {
    const init = async () => {
      try {
        // Fetch students
        const studentRes = await api.get('/users/students');
        setMyStudents(studentRes.data.data);

        // Fetch quiz if edit mode
        if (isEditMode) {
          const res = await api.get(`/quizzes/${id}`);
          const q = res.data.data;
          setQuizData({
            title: q.title,
            description: q.description,
            category: q.category,
            difficulty: q.difficulty,
            timeLimit: q.timeLimit || '',
            availableFrom: q.availableFrom ? new Date(q.availableFrom).toISOString().slice(0, 16) : '',
            availableUntil: q.availableUntil ? new Date(q.availableUntil).toISOString().slice(0, 16) : '',
            isPublished: q.isPublished,
          });
          setAssignedStudents(q.assignedStudents || []);
          setQuestions(
            q.questions.map((qq) => {
              const ci = qq.options.findIndex((o) => o.text === qq.correctAnswer);
              return {
                questionText: qq.questionText,
                options: qq.options.map((o) => ({ text: o.text })),
                correctAnswer: qq.correctAnswer,
                _correctIndex: ci !== -1 ? ci : null,
              };
            })
          );
        }
      } catch (err) {
        setError('Failed to load data.');
      } finally {
        setInitialLoading(false);
      }
    };
    init();
  }, [id, isEditMode]);

  /* Handlers */
  const handleQuizChange = (e) =>
    setQuizData({ ...quizData, [e.target.name]: e.target.value });

  const handleQuestionChange = (qi, field, value) => {
    const next = [...questions];
    next[qi][field] = value;
    setQuestions(next);
  };

  const handleOptionChange = (qi, oi, value) => {
    const next = [...questions];
    next[qi].options[oi].text = value;
    setQuestions(next);
  };

  const addQuestion = () => setQuestions([...questions, defaultQuestion()]);

  const removeQuestion = (qi) => {
    if (questions.length > 1) setQuestions(questions.filter((_, i) => i !== qi));
  };

  const addOption = (qi) => {
    const next = [...questions];
    if (next[qi].options.length < 6) next[qi].options.push({ text: '' });
    setQuestions(next);
  };

  const removeOption = (qi, oi) => {
    const next = [...questions];
    if (next[qi].options.length > 2) {
      next[qi].options.splice(oi, 1);
      if (next[qi]._correctIndex === oi) next[qi]._correctIndex = null;
      else if (next[qi]._correctIndex > oi) next[qi]._correctIndex--;
    }
    setQuestions(next);
  };

  const setCorrect = (qi, oi) => {
    const next = [...questions];
    next[qi]._correctIndex = oi;
    setQuestions(next);
  };
  
  const toggleStudent = (studentId) => {
    if (assignedStudents.includes(studentId)) {
      setAssignedStudents(assignedStudents.filter(id => id !== studentId));
    } else {
      setAssignedStudents([...assignedStudents, studentId]);
    }
  };

  const validateAndBuild = () => {
    if (!quizData.title) return setError('Quiz title is required'), null;
    if (!quizData.description) return setError('Description is required'), null;
    if (!quizData.category) return setError('Category is required'), null;
    if (!quizData.timeLimit || isNaN(quizData.timeLimit) || Number(quizData.timeLimit) < 1 || Number(quizData.timeLimit) > 180) {
      return setError('Time limit must be a valid number between 1 and 180 minutes'), null;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText) return setError(`Question ${i + 1} needs text`), null;
      if (q.options.some((o) => !o.text.trim()))
        return setError(`Question ${i + 1} has empty options`), null;
      if (q._correctIndex === null || q._correctIndex === undefined)
        return setError(`Select correct answer for Question ${i + 1}`), null;
    }

    if (quizData.availableFrom && quizData.availableUntil && new Date(quizData.availableFrom) > new Date(quizData.availableUntil)) {
      return setError('Available Until must be after Available From'), null;
    }

    return {
      ...quizData,
      timeLimit: Number(quizData.timeLimit),
      availableFrom: quizData.availableFrom ? new Date(quizData.availableFrom).toISOString() : null,
      availableUntil: quizData.availableUntil ? new Date(quizData.availableUntil).toISOString() : null,
      assignedStudents,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        options: q.options.map((o) => ({ text: o.text })),
        correctAnswer: q.options[q._correctIndex].text,
      })),
    };
  };

  const handleSave = async (publish) => {
    setError('');
    const payload = validateAndBuild();
    if (!payload) return;
    payload.isPublished = publish;

    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/quizzes/${id}`, payload);
      } else {
        await api.post('/quizzes', payload);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleTestTiming = async () => {
    setError('');
    const payload = validateAndBuild();
    if (!payload) return;
    payload.isPublished = true;

    setLoading(true);
    try {
      let targetId = id;
      if (isEditMode) {
        await api.put(`/quizzes/${id}`, payload);
      } else {
        const res = await api.post('/quizzes', payload);
        targetId = res.data.data._id;
      }
      navigate(`/quizzes/${targetId}/take`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start quiz timer test');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading)
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
        Loading quiz editor...
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="create-header">
        <div className="create-header-text">
          <h1>{isEditMode ? 'Edit Quiz' : 'Create New Quiz'}</h1>
          <p>Build quizzes for your students and test the timing before publishing</p>
        </div>
        <div className="create-header-actions">
          <button
            className="btn btn-outline"
            onClick={() => handleSave(false)}
            disabled={loading}
          >
            <Send size={16} /> Save Draft
          </button>
          <button
            className="btn btn-outline"
            onClick={handleTestTiming}
            disabled={loading}
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary-light)' }}
            title="Save and launch test mode to verify countdown timer"
          >
            ⏱ Test Quiz & Timer
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleSave(true)}
            disabled={loading}
          >
            <Send size={16} /> {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="create-quiz-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column */}
        <div style={{ minWidth: 0 }}>
          {/* Quiz Information */}
          <div className="info-card">
            <h2 className="info-card-title">Quiz Information</h2>

            <div className="form-group">
              <label className="form-label">Quiz Title</label>
              <input
                className="form-control"
                name="title"
                value={quizData.title}
                onChange={handleQuizChange}
                placeholder="Enter quiz title"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                name="description"
                value={quizData.description}
                onChange={handleQuizChange}
                rows={3}
                placeholder="Enter quiz description"
              />
            </div>

            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <input
                  className="form-control"
                  name="category"
                  value={quizData.category}
                  onChange={handleQuizChange}
                  placeholder="e.g. Programming"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Difficulty</label>
                <select
                  className="form-control"
                  name="difficulty"
                  value={quizData.difficulty}
                  onChange={handleQuizChange}
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Time Limit (min)</label>
                <input
                  className="form-control"
                  name="timeLimit"
                  type="number"
                  min="1"
                  value={quizData.timeLimit}
                  onChange={handleQuizChange}
                  placeholder="e.g. 15"
                />
              </div>
            </div>

            {/* Optional Availability Window */}
            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Available From (Optional)</label>
                <input
                  className="form-control"
                  name="availableFrom"
                  type="datetime-local"
                  value={quizData.availableFrom}
                  onChange={handleQuizChange}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Available Until (Optional)</label>
                <input
                  className="form-control"
                  name="availableUntil"
                  type="datetime-local"
                  value={quizData.availableUntil}
                  onChange={handleQuizChange}
                />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="questions-header" style={{ marginBottom: '1rem' }}>
              <h2 className="questions-title">Quiz Questions</h2>
              <button className="btn btn-primary" type="button" onClick={addQuestion}>
                <Plus size={16} /> Add Question
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {questions.map((q, qi) => (
                <div key={qi} className="question-card">
                  <div className="question-card-header">
                    <div className="question-card-heading">
                      <span className="question-number-badge">
                        {String(qi + 1).padStart(2, '0')}
                      </span>
                      Quiz Question
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="btn-icon delete"
                        onClick={() => removeQuestion(qi)}
                        title="Delete question"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Question</label>
                    <input
                      className="form-control"
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(qi, 'questionText', e.target.value)}
                      placeholder="Enter your question..."
                    />
                  </div>

                  <label className="form-label">Answer Options</label>
                  <div className="options-list">
                    {q.options.map((opt, oi) => (
                      <div
                        key={oi}
                        className={`option-row ${q._correctIndex === oi ? 'is-correct' : ''}`}
                      >
                        <span className="option-letter">{ALPHABET[oi]}</span>
                        <input
                          className="option-input"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(qi, oi, e.target.value)}
                          placeholder={`Enter option ${ALPHABET[oi]}...`}
                        />
                        <button
                          type="button"
                          className={`option-correct-btn ${q._correctIndex === oi ? 'selected' : ''}`}
                          onClick={() => setCorrect(qi, oi)}
                        >
                          {q._correctIndex === oi ? <Check size={12} /> : '○'} Correct
                        </button>
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            className="option-delete-btn"
                            onClick={() => removeOption(qi, oi)}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {q.options.length < 6 && (
                    <button type="button" className="add-option-btn" onClick={() => addOption(qi)}>
                      <Plus size={14} /> Add option
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column: Student Assignment */}
        <div className="info-card" style={{ position: 'sticky', top: '2rem' }}>
          <h2 className="info-card-title">Assign Students</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
            Select the students who should take this quiz.
          </p>
          
          {myStudents.length === 0 ? (
            <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center', border: '1px solid #e2e8f0', color: '#64748b' }}>
              You don't have any students yet. Go to "My Students" to add some.
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ width: '100%', fontSize: '0.8125rem', padding: '0.4rem', justifyContent: 'center' }}
                  onClick={() => {
                    if (assignedStudents.length === myStudents.length) {
                      setAssignedStudents([]);
                    } else {
                      setAssignedStudents(myStudents.map(s => s._id));
                    }
                  }}
                >
                  {assignedStudents.length === myStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {myStudents.map(student => (
                  <label key={student._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: assignedStudents.includes(student._id) ? 'var(--primary-light)' : '#f8fafc', border: `1px solid ${assignedStudents.includes(student._id) ? 'var(--primary)' : '#e2e8f0'}`, borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                    <input 
                      type="checkbox" 
                      checked={assignedStudents.includes(student._id)} 
                      onChange={() => toggleStudent(student._id)} 
                      style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.email}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--text-light)', textAlign: 'right' }}>
                {assignedStudents.length} selected
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
