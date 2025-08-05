# ⏱️ Time Tracker App

A full-stack web application to log work hours, manage projects, and monitor productivity. Built using **Next.js (App Router)**, **PostgreSQL**, **Prisma**, and **Tailwind CSS**.

## 🧩 Features

- User Authentication (NextAuth.js or JWT-based)
- Role-based Dashboards (Admin and Regular Users)
- Manual and Live Time Logging
- Project Assignment by Admin
- Time Summaries filtered by user/project
- Responsive UI with Tailwind CSS

---

## 🚀 Live Demo

[Click here to view live demo](https://your-live-url.vercel.app)  
*(Replace with your actual deployed URL)*

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: NextAuth.js or JWT
- **Hosting**: Vercel

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
