# QuizMaster 🎯

**CodSoft Internship — Level 2 · Task 2**

A full-stack MERN-based online quiz platform designed for a teacher-student classroom workflow. Teachers can create and manage quizzes, create student accounts, assign quizzes, monitor performance, and view detailed results. Students can securely access their assigned quizzes, complete timed assessments, and review their results.

## 🌐 Live Demo

**QuizMaster:**  
https://usharanih0515-lang.github.io/codsoft_task2_quizmaster/

> Backend API is deployed separately and configured through the frontend environment variable.

---

## ✨ Features

### 🔐 Authentication & Role-Based Access

- JWT authentication
- Secure bcrypt password hashing
- Teacher registration and login
- Teacher-created student accounts
- Role-based teacher/student access
- Protected frontend routes
- Server-side authorization
- Student accounts can be associated with their teacher
- First-login password change support

### 👨‍🏫 Teacher Features

- Teacher dashboard
- Create quizzes
- Edit quizzes
- Delete owned quizzes
- Add multiple-choice questions
- Assign quizzes to selected students
- Create and manage students
- Set quiz difficulty
- Set quiz time limit
- Configure quiz availability window
- Teacher test mode
- View student attempts
- View detailed quiz results
- View quiz performance analytics
- View total students
- View total quizzes
- View total attempts
- View average score

### 👨‍🎓 Student Features

- Secure student login
- View assigned quizzes
- Start quiz with confirmation
- Server-controlled countdown timer
- One-question-at-a-time quiz interface
- Question navigator
- Answered-question tracking
- Auto-save answers
- Refresh-safe quiz attempts
- Automatic submission when time expires
- Manual submission confirmation
- Instant results
- Correct/incorrect/unanswered review
- Personal results history

### ⏱️ Secure Quiz Timing

Quiz timing is enforced by the backend.

- Timer starts only after the student starts the quiz
- `expiresAt` is calculated by the server
- Browser refresh does not reset the timer
- Countdown is synchronized with the server deadline
- Automatic submission occurs when the timer reaches zero
- Backend validates the submission deadline
- Students cannot extend the quiz by changing browser-side timer values

### 📊 Analytics

Teachers can monitor:

- Total students
- Total quizzes
- Total attempts
- Average score
- Students assigned per quiz
- Students who attempted a quiz
- Completion rate
- Average quiz score
- Student name
- Student email
- Quiz title
- Score
- Percentage
- Time taken
- Submission status
- Submission date

### 📅 Quiz Availability

Teachers can optionally configure:

- Available From
- Available Until

The backend validates the availability window so students cannot bypass it through the frontend.

---

## 🛡️ Security

- JWT-based authentication
- Passwords hashed using bcrypt
- Server-side role authorization
- Teacher ownership validation
- Student assignment validation
- Server-side score calculation
- Correct answers are not exposed during quiz taking
- Server-enforced quiz deadlines
- Server-enforced quiz availability
- Students can access only their assigned quizzes
- Students can view only their own results
- Teachers can access only their own quizzes, students, and results
- `.env` files are excluded from Git

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 |
| Build Tool | Vite |
| Routing | React Router |
| Backend | Node.js |
| API | Express |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcrypt |
| HTTP Client | Axios |
| Icons | Lucide React |
| Deployment | GitHub Pages + Backend Hosting |

---

## 📁 Project Structure

```text
QuizMaster/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── quizController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Quiz.js
│   │   └── QuizAttempt.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── quizRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md