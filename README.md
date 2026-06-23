# ⚽ Player Attendance Tracker

A full-stack attendance management system designed for football academies to efficiently manage players, sessions, and attendance records.

## 🚀 Overview

The Player Attendance Tracker enables coaches to manage training sessions, track player attendance, monitor complimentary sessions, and analyze attendance trends through a modern and responsive dashboard.

Built as a full-stack application using modern web technologies with secure authentication and scalable architecture.

---

## ✨ Features

### 🔐 Authentication

* Secure Coach Login
* JWT-based Authentication
* Protected Routes
* Role-based Access Control

### 👥 Player Management

* View Players
* Add New Players
* Update Player Details
* Delete Players
* Age Group Management

### 📅 Session Management

* Create Training Sessions
* Morning & Evening Sessions
* Assign Players to Sessions
* Track Session Usage

### ✅ Attendance Tracking

* Mark Attendance

  * Present (Regular)
  * Present (Complimentary)
  * Absent
* Attendance History
* Attendance Summary

### 📊 Dashboard & Analytics

* Attendance Statistics
* Player Attendance Insights
* Session Utilization Metrics
* Quick Overview Dashboard

### 📱 Responsive Design

* Mobile Friendly
* Tablet Support
* Desktop Optimized

---

## 🏗️ System Architecture

Frontend (Next.js + TypeScript)
⬇
REST API
⬇
Backend (NestJS)
⬇
Prisma ORM
⬇
PostgreSQL Database

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn UI
* Axios

### Backend

* NestJS
* TypeScript
* JWT Authentication
* Bcrypt
* Multer

### Database

* PostgreSQL
* Prisma ORM

### Development Tools

* Git
* GitHub
* VS Code
* Docker

---

## 📂 Project Structure

```text
player-attendance-tracker/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
├── backend/
│   ├── src/
│   ├── prisma/
│   └── uploads/
│
├── docs/
├── README.md
└── package.json
```

## ⚙️ Installation

### Clone Repository

```bash
git clone <repository-url>
cd player-attendance-tracker
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

---

## 🔑 Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
PORT=3001
```

---

## 📈 Future Enhancements

* Email Notifications
* Attendance Reports Export
* SMS Reminders
* Advanced Analytics
* Multi-Coach Support
* Cloud Storage Integration

---

## 👨‍💻 Contributors

### Charles S

* Full Stack Development
* Frontend Development
* Backend Development

### Monika Padmanathan

* Project Development
* Testing & Documentation

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

Special thanks to Whitefield FC Academy for providing the project requirements and use case inspiration.
