# CampusGuide - Step 1: Signup and Login (Supabase version)

Built with **React + Vite** and **Supabase** (Authentication + Postgres database).
Roles: **student**, **faculty**, **admin**.

## Folder structure

```
campus-guide-auth/
├── index.html
├── package.json
├── vite.config.js
├── .env.example              <- copy to .env and add your Supabase keys
├── supabase/schema.sql       <- run once in Supabase SQL Editor
└── src/
    ├── main.jsx
    ├── App.jsx               <- routes
    ├── supabase.js           <- Supabase connection
    ├── utils.js              <- role redirects + friendly error messages
    ├── styles.css
    ├── context/AuthContext.jsx        <- signup, login, logout, user + role
    ├── components/ProtectedRoute.jsx  <- blocks pages by role
    ├── components/DashboardLayout.jsx
    └── pages/  Login, Signup, StudentDashboard, FacultyDashboard, AdminDashboard
```

## Setup

1. Supabase Dashboard -> **Authentication -> Sign In / Providers -> Email**:
   turn **Enable email provider** ON and **Confirm email** OFF (for development). Save.
2. **SQL Editor -> New query**: paste `supabase/schema.sql` and **Run**
   (skip if you already ran it - running it twice gives "already exists").
3. To enable admin announcements, run `supabase/schema_notifications.sql` in the
   SQL Editor after `schema.sql`. This creates the notifications table and its
   access policies; it is safe to run even if `schema_rooms.sql` already created
   the table.
4. **Project Settings -> API**: copy the **Project URL** and the **anon / publishable key**.
5. Copy `.env.example` to `.env` and paste the two values.
6. Install and run (Node.js 18 or newer):

```
npm install
npm run dev
```

Open http://localhost:5173

## How it works

- **Signup** calls Supabase Auth. The name, role, USN, year, section (student) or
  employee ID, department (faculty) are sent along, and a database trigger saves them in
  the `profiles` table. Only `student` or `faculty` can be chosen from the app.
- **Login** signs in, reads the role from `profiles`, and opens `/student`, `/faculty` or `/admin`.
- **ProtectedRoute** stops a user from opening another role's page.
- Row Level Security lets each user read only their own profile (admins can read all),
  and nobody can change their own role.

## AI Assistant (free setup)

The AI chat calls a Supabase Edge Function `ai-chat`, which proxies to any
OpenAI-compatible API. Use a **free** provider such as [Groq](https://console.groq.com)
(no billing required).

1. Create a free Groq key at https://console.groq.com/keys (starts with `gsk_`).
2. Set the Edge Function secrets (Supabase -> Project Settings -> Edge Functions,
   or the CLI):
   ```
   supabase secrets set OPENAI_API_KEY=gsk_your_key
   supabase secrets set OPENAI_BASE_URL=https://api.groq.com/openai/v1
   supabase secrets set OPENAI_MODEL=llama-3.3-70b-versatile
   ```
3. Deploy the function:
   ```
   supabase functions deploy ai-chat
   ```
4. Sign in to the app (non-demo account) and open the AI Guide — it now answers.

The AI key never reaches the browser; it lives only as an Edge Function secret.

## Create the Admin account

1. Sign up in the app as a student.
2. Supabase -> **Table Editor -> profiles** -> click your row.
3. Change `role` from `student` to `admin` and save.
4. Log out and log in again -> you land on the Admin dashboard.

## Next steps

Rooms database (floors, classrooms, labs, offices), classroom search, floor map,
classroom allocation by year and section, notifications, and a forgot-password page.
