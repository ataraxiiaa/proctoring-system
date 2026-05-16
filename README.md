# Real-Time AI Proctoring System

A robust, production-quality AI-powered proctoring system designed to monitor online exams in real-time. Built with a FastAPI backend and a Next.js frontend.

## 🚀 Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL (Hosted on Supabase)
- **ORM:** SQLAlchemy
- **Authentication:** JWT (JSON Web Tokens) with Bcrypt password hashing
- **Validation:** Pydantic

### Frontend
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS

## 🛠️ Features (Implemented)
- **Secure Authentication:** User registration and login with encrypted passwords.
- **Database Architecture:** Scalable PostgreSQL schema for users and roles.
- **CORS Configured:** Seamless communication between Next.js and FastAPI.
- **API Documentation:** Automatic Swagger documentation at `/docs`.

## 🏃‍♂️ Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js & npm
- A Supabase account (PostgreSQL)

### 2. Backend Setup
1. Navigate to the server folder: `cd server`
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `.\venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt`
5. Create a `.env` file based on the environment requirements (Database URL, Secret Keys).
6. Start the server: `uvicorn app.main:app --reload`

### 3. Frontend Setup
1. Navigate to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## 📈 Future Roadmap
- [ ] Real-time video/audio proctoring with AI.
- [ ] Browser tracking and restriction.
- [ ] Exam management dashboard for admins.
- [ ] Automated incident reporting.
