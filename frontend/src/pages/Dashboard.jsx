import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Trophy, Award, Plus, Eye, Pencil, Trash2, BarChart2 } from 'lucide-react';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, quizzesRes, studentsRes] = await Promise.allSettled([
        api.get('/quizzes/teacher/analytics'),
        api.get('/quizzes/my'),
        api.get('/users/students'),
      ]);

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data.data);
      }
      if (quizzesRes.status === 'fulfilled') {
        setQuizzes(quizzesRes.value.data.data || []);
      }
      if (studentsRes.status === 'fulfilled') {
        setStudents(studentsRes.value.data.data || []);
      }
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
      fetchDashboardData();
    } catch {
      alert('Failed to delete quiz');
    }
  };

  const getDifficultyBadge = (diff) => {
    if (diff === 'Easy') return 'badge badge-success';
    if (diff === 'Medium') return 'badge badge-warning';
    return 'badge badge-danger';
  };

  // Derive stats with fallback to local count
  const totalStudents = analytics ? analytics.totalStudents : students.length;
  const totalQuizzes = analytics ? analytics.totalQuizzes : quizzes.length;
  const totalAttempts = analytics ? analytics.totalAttempts : 0;
  const averageScore = analytics ? analytics.averageScore : 0;

  // Derive per-quiz performance table data
  const quizPerformanceList = (analytics && analytics.quizPerformance && analytics.quizPerformance.length > 0)
    ? analytics.quizPerformance
    : quizzes.map((q) => ({
        quizId: q._id,
        title: q.title,
        assignedStudents: q.assignedStudents ? q.assignedStudents.length : 0,
        studentsAttempted: 0,
        completionRate: 0,
        averageScore: 0,
        isPublished: q.isPublished,
      }));

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'blue' },
    { label: 'Total Quizzes', value: totalQuizzes, icon: BookOpen, color: 'green' },
    { label: 'Total Attempts', value: totalAttempts, icon: Trophy, color: 'orange' },
    { label: 'Average Score', value: `${averageScore}%`, icon: Award, color: 'purple' },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="page-subtitle">Manage your quizzes, track student performance, and view analytics.</p>
      </div>

      {/* 8. Summary Cards */}
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

      {/* 9. Quiz Performance Analytics */}
      <div className="dashboard-section-header" style={{ marginTop: '2rem' }}>
        <h2 className="dashboard-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--primary)" /> Quiz Performance Analytics
        </h2>
      </div>

      <div className="quiz-table-card" style={{ marginBottom: '2rem' }}>
        <div className="quiz-table-wrapper">
          {loading ? (
            <div className="empty-table">Loading analytics...</div>
          ) : quizPerformanceList.length === 0 ? (
            <div className="empty-table">No quizzes created yet. Create a quiz to view performance analytics.</div>
          ) : (
            <table className="quiz-table">
              <thead>
                <tr>
                  <th>Quiz Title</th>
                  <th>Students Assigned</th>
                  <th>Students Attempted</th>
                  <th>Completion Rate</th>
                  <th>Average Score</th>
                </tr>
              </thead>
              <tbody>
                {quizPerformanceList.map((p) => (
                  <tr key={p.quizId}>
                    <td className="quiz-title-cell">{p.title}</td>
                    <td>{p.assignedStudents}</td>
                    <td>{p.studentsAttempted}</td>
                    <td>
                      <span className="badge badge-primary">{p.completionRate}%</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.averageScore >= 75
                            ? 'badge-success'
                            : p.averageScore >= 50
                            ? 'badge-warning'
                            : 'badge-danger'
                        }`}
                      >
                        {p.averageScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* My Quizzes Management */}
      <div className="dashboard-section-header">
        <h2 className="dashboard-section-title">My Quizzes</h2>
        <Link to="/create-quiz" className="btn btn-primary">
          <Plus size={16} /> Create Quiz
        </Link>
      </div>

      <div className="quiz-table-card">
        <div className="quiz-table-wrapper">
          {loading ? (
            <div className="empty-table">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="empty-table">
              <p style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>
                No quizzes yet. Create your first quiz!
              </p>
              <Link to="/create-quiz" className="btn btn-primary">
                <Plus size={16} /> Create Quiz
              </Link>
            </div>
          ) : (
            <table className="quiz-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Questions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td className="quiz-title-cell">{quiz.title}</td>
                    <td>{quiz.category}</td>
                    <td>
                      <span className={getDifficultyBadge(quiz.difficulty)}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td>{quiz.questions?.length || 0}</td>
                    <td>
                      <span className={quiz.isPublished ? 'badge badge-success' : 'badge badge-warning'}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td>
                      <div className="quiz-actions">
                        <button
                          className="btn-icon view"
                          onClick={() => navigate(`/quizzes/${quiz._id}/take`)}
                          title="Test Timer"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.65rem', fontSize: '0.8rem', background: 'var(--primary-light)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                        >
                          ⏱ Test Timer
                        </button>
                        <button
                          className="btn-icon view"
                          onClick={() => navigate(`/quizzes/${quiz._id}`)}
                          title="View"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          className="btn-icon edit"
                          onClick={() => navigate(`/edit-quiz/${quiz._id}`)}
                          title="Edit"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(quiz._id)}
                          title="Delete"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
