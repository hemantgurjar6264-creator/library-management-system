# 📚 Bibliotheca — Library Management System

Full-stack Library Management System.

- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Auth:** JWT-based login for Admin/Librarian

## Features

- Secure login/register (JWT authentication)
- Dashboard with live stats (total books, members, issued books, overdue count)
- Book catalog — add, edit, delete, search by title/author/ISBN, track copies & rack location
- Member management — register, edit, activate/suspend, search
- Circulation desk — issue books to members, return books, automatic overdue detection, automatic fine calculation (₹5/day late)
- Clean, professional, responsive UI (custom "library card catalog" design theme)

---

## 📁 Project Structure

```
library-management-system/
├── backend/          → Node.js + Express API
│   ├── config/       → MongoDB connection
│   ├── controllers/  → Route logic
│   ├── middleware/   → Auth & error handling
│   ├── models/       → Mongoose schemas (Book, Member, Transaction, User)
│   ├── routes/       → API routes
│   ├── server.js     → App entry point
│   └── .env.example
└── frontend/         → React + Vite + Tailwind app
    ├── src/
    │   ├── api/          → Axios instance
    │   ├── components/   → Reusable UI components
    │   ├── context/      → Auth context
    │   ├── pages/        → Login, Dashboard, Books, Members, Transactions
    │   ├── App.jsx
    │   └── main.jsx
    └── .env.example
```

---

## 🚀 Setup Instructions

### 1. MongoDB Atlas Setup (Database)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create a **free cluster** (M0).
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for development.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your credentials, and add a database name, e.g. `/library_db` before the `?`.

### 2. Backend Setup

```bash
cd backend
npm install
```

Rename `.env.example` to `.env` and fill in your values:

```
MONGO_URI=mongodb+srv://your_user:your_pass@cluster.mongodb.net/library_db?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=any_long_random_secret_string
CLIENT_URL=http://localhost:5173
```

Run the backend:

```bash
npm run dev
```

Backend will run at `http://localhost:5000`. Visiting `http://localhost:5000/` should show a JSON message confirming the API is running.

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

Rename `.env.example` to `.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Run the frontend:

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`.

### 4. First Use

1. Open `http://localhost:5173` in your browser.
2. Click **"Create admin account"** and register the first admin user.
3. You'll be logged in automatically and land on the Dashboard.
4. Start by adding books (Catalog page) and members (Members page).
5. Use the **Circulation Desk** (Transactions page) to issue and return books.

---

## 🔑 API Endpoints (for reference)

| Method | Endpoint                          | Description                  |
|--------|------------------------------------|-------------------------------|
| POST   | /api/auth/register                | Register admin/librarian      |
| POST   | /api/auth/login                   | Login                         |
| GET    | /api/auth/me                      | Get current user              |
| GET    | /api/books                        | List/search books             |
| POST   | /api/books                        | Add a book                    |
| PUT    | /api/books/:id                    | Update a book                 |
| DELETE | /api/books/:id                    | Delete a book                 |
| GET    | /api/members                      | List/search members           |
| POST   | /api/members                      | Register a member             |
| PUT    | /api/members/:id                  | Update a member                |
| DELETE | /api/members/:id                  | Delete a member                |
| GET    | /api/transactions                 | List transactions              |
| POST   | /api/transactions/issue           | Issue a book                   |
| PUT    | /api/transactions/:id/return      | Return a book                  |
| GET    | /api/transactions/stats/dashboard | Dashboard statistics           |

All routes except `/auth/register` and `/auth/login` require a `Bearer <token>` header.

---

## 🛠️ Tech Stack Details

- **Backend:** Express 4, Mongoose 8, bcryptjs (password hashing), jsonwebtoken (auth), express-async-handler
- **Frontend:** React 18, React Router 6, Axios, react-hot-toast (notifications), lucide-react (icons), Tailwind CSS 3

## 📦 Deployment Notes

- **Backend:** Deploy to Render / Railway / Cyclic. Set the environment variables from `.env` in your hosting dashboard.
- **Frontend:** Deploy to Vercel / Netlify. Set `VITE_API_URL` to your deployed backend URL + `/api`.
- Update `CLIENT_URL` in the backend `.env` to your deployed frontend URL for CORS to work correctly.

---

Built with ❤️ for your library management needs.
