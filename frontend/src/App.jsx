import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import TeacherRoute from './components/TeacherRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import CreateQuiz from './pages/CreateQuiz';
import QuizList from './pages/QuizList';
import QuizDetails from './pages/QuizDetails';
import TakeQuiz from './pages/TakeQuiz';
import QuizResults from './pages/QuizResults';
import MyResults from './pages/MyResults';
import Students from './pages/Students';
import Settings from './pages/Settings';
import AccessDenied from './pages/AccessDenied';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public auth routes — no sidebar */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Change password — accessible when logged in but must change */}
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>

        {/* Protected app routes — Sidebar + TopBar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Root redirect based on role is handled inside ProtectedRoute */}
            <Route path="/" element={<Navigate to="/student-dashboard" replace />} />

            {/* Student routes */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quizzes/:id" element={<QuizDetails />} />
            <Route path="/quizzes/:id/take" element={<TakeQuiz />} />
            <Route path="/quizzes/:id/results" element={<QuizResults />} />
            <Route path="/my-results" element={<MyResults />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/access-denied" element={<AccessDenied />} />

            {/* Teacher-only routes */}
            <Route element={<TeacherRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-quiz" element={<CreateQuiz />} />
              <Route path="/edit-quiz/:id" element={<CreateQuiz />} />
              <Route path="/students" element={<Students />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
