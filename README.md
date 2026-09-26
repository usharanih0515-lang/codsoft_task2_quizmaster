# Online Quiz Maker 🎯

**CodSoft Internship — Level 2 · Task 2**

A full-stack MERN application where users can create, share, and take quizzes with instant scoring and feedback.

---

## Features

- 🔐 **JWT Authentication** — Register, Login, Logout with bcrypt password hashing
- ✏️ **Quiz Creation** — Dynamic question builder with exactly 4 options per question
- 🔍 **Quiz Discovery** — Search, filter by category and difficulty
- 🎯 **Quiz Taking** — One question at a time with progress tracking
- 📊 **Instant Results** — Backend-calculated score with answer review
- 🖥️ **Dashboard** — Manage your own quizzes (create, view, delete)
- 📱 **Responsive Design** — Works on mobile (320px+), tablet and desktop

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, React Router v6   |
| Backend  | Node.js, Express 5                |
| Database | MongoDB, Mongoose                 |
| Auth     | JWT, bcrypt                       |
| HTTP     | Axios                             |
| Icons    | Lucide React                      |

---

## Project Structure

```
Task2_OnlineQuizMaker/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   └── quizController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   └── Quiz.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── quizRoutes.js
│   │   └── userRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Footer.jsx
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── CreateQuiz.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── QuizDetails.jsx
    │   │   ├── QuizList.jsx
    │   │   ├── QuizResults.jsx
    │   │   ├── Register.jsx
    │   │   └── TakeQuiz.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    ├── package.json
    └── vite.config.js
```

---

## Environment Variables

### Backend (`backend/.env`)
```
MONGODB_URI=mongodb://localhost:27017/online-quiz-maker
JWT_SECRET=your_strong_random_secret_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:5000/api
```

> ⚠️ Never commit `.env` files. Use `.env.example` as a template.

---

## Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone / Navigate to the project
```bash
cd Task2_OnlineQuizMaker
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env and fill in MONGODB_URI and JWT_SECRET
npm install
npm run dev
```
Backend runs at: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## API Endpoints

### Authentication
| Method | Endpoint            | Access  | Description       |
|--------|---------------------|---------|-------------------|
| POST   | /api/auth/register  | Public  | Register user     |
| POST   | /api/auth/login     | Public  | Login user        |
| GET    | /api/auth/me        | Private | Get current user  |

### Quizzes
| Method | Endpoint                  | Access  | Description             |
|--------|---------------------------|---------|-------------------------|
| GET    | /api/quizzes              | Public  | List/search quizzes     |
| GET    | /api/quizzes/:id          | Public  | Get quiz details        |
| POST   | /api/quizzes              | Private | Create quiz             |
| PUT    | /api/quizzes/:id          | Private | Update quiz (owner)     |
| DELETE | /api/quizzes/:id          | Private | Delete quiz (owner)     |
| POST   | /api/quizzes/:id/submit   | Private | Submit quiz answers     |

### User
| Method | Endpoint              | Access  | Description           |
|--------|-----------------------|---------|-----------------------|
| GET    | /api/users/me         | Private | Get current user info |
| GET    | /api/users/me/quizzes | Private | Get user's quizzes    |

---

## Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- **JWT** tokens expire after 30 days
- Correct answers **never exposed** during quiz-taking
- Score calculated **server-side only**
- Ownership validated before edit/delete operations
- No secrets stored in frontend code

---

## Deployment

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# deploy the dist/ folder
# Set VITE_API_URL env var to your backend URL
```

### Backend (Railway / Render / Heroku)
```bash
cd backend
# Set environment variables:
# MONGODB_URI, JWT_SECRET, PORT, FRONTEND_URL
npm start
```

---

*CodSoft Internship · Level 2 · Task 2*
