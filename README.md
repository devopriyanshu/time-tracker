# ⏱️ Time Tracker App

A full-stack time tracking web application built with **Next.js (App Router)**, **Prisma**, **PostgreSQL**, and **Tailwind CSS**. It supports **Admin** and **User** roles, allowing users to track their time with manual entries or live timers, and providing admins with detailed time log summaries and project/user management.

---

## 🔥 Features

### 👤 Authentication
- Secure login using **NextAuth.js**
- Session management with role-based access (Admin / User)

### 🧑‍💼 Admin Dashboard
- Create and manage **projects**
- Assign users to projects
- View time logs filtered by **user** or **project**
- Summary cards showing total hours, users, and active projects

### 🧑‍💻 User Dashboard
- **Live Timer**: Start, pause, and stop timers
- **Manual Entry**: Add time logs manually for specific projects
- View logs filtered by day/week
- Track personal work history and durations

### 🧱 Tech Stack
- **Frontend**: Next.js App Router, Tailwind CSS
- **Backend**: Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

---


## 🚀 Live Demo

[Click here to view live demo]([https://your-live-url.vercel.app](https://time-tracker-rho-sandy.vercel.app/))  
*(Replace with your actual deployed URL)*

---

## 📦 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/time-tracker-app.git
cd time-tracker-app
```

### 2. Install Dependencies
```bash
npm install
```
### 3. Set Up Environment Variables
```bash
cp .env.example .env
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run DEV server
```bash
npm run dev
```
