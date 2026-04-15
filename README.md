# Event Management System

A full-stack event management platform for educational institutions with role-based access (Student, Faculty, Admin), atomic enrollment, and premium UI.

## Tech Stack

- **Backend**: Node.js, TypeScript, Express, MongoDB, JWT Auth
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand

## How to Run (Mac / Linux / Windows)

### Prerequisites

- **Node.js 18+** — Install on Mac: `brew install node`

### One-Command Start (Mac/Linux)

```bash
# Unzip, then in Terminal:
cd Event-Management
chmod +x start.sh
./start.sh
```

This will:
1. Check Node.js is installed
2. Install all backend & frontend dependencies
3. Start both servers
4. Open the app at http://localhost:5173

### Manual Start (any OS)

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

### Access

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173         |
| Backend  | http://localhost:3000         |
| API Docs | http://localhost:3000/api-docs |

### Seed Test Data (optional)

```bash
cd backend
npm run seed
```

## Project Structure

```
Event-Management/
├── start.sh              # One-click run script (Mac/Linux)
├── backend/
│   ├── src/
│   │   ├── config/       # Environment config
│   │   ├── controllers/  # Auth, Activity, Dashboard controllers
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── models/       # User, Activity, Participation schemas
│   │   ├── routes/       # API route definitions
│   │   ├── types/        # TypeScript interfaces
│   │   ├── utils/        # Logger, email
│   │   ├── app.ts        # Express app
│   │   └── server.ts     # Entry point
│   ├── tests/            # Jest test suites
│   ├── scripts/          # Seed, index fix utilities
│   └── .env              # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # 15 page components
│   │   ├── services/     # API service layer (Axios)
│   │   ├── store/        # Auth & theme state (Zustand)
│   │   └── utils/        # Utilities
│   └── .env              # Frontend environment variables
└── docs/                 # Architecture & Privacy docs
```

## API Endpoints

| Method | Endpoint                           | Auth     | Description          |
|--------|------------------------------------|----------|----------------------|
| POST   | /api/auth/register                 | Public   | Register user        |
| POST   | /api/auth/login                    | Public   | Login                |
| POST   | /api/auth/refresh                  | Public   | Refresh token        |
| POST   | /api/auth/logout                   | Auth     | Logout               |
| GET    | /api/auth/profile                  | Auth     | Get profile          |
| PUT    | /api/auth/change-password          | Auth     | Change password      |
| GET    | /api/activities                    | Public   | List activities      |
| POST   | /api/activities                    | Faculty  | Create activity      |
| PUT    | /api/activities/:id                | Faculty  | Update activity      |
| DELETE | /api/activities/:id                | Faculty  | Delete activity      |
| POST   | /api/activities/:id/enroll         | Student  | Enroll               |
| POST   | /api/activities/:id/cancel         | Student  | Cancel enrollment    |
| GET    | /api/activities/:id/participants   | Faculty  | View participants    |
| GET    | /api/dashboard/student             | Student  | Student dashboard    |
| GET    | /api/dashboard/faculty             | Faculty  | Faculty dashboard    |
| GET    | /api/dashboard/admin               | Admin    | Admin dashboard      |

## Testing

```bash
cd backend && npm test       # Backend tests (uses in-memory MongoDB)
cd frontend && npm test      # Frontend tests
```

## Troubleshooting (Mac)

| Issue                        | Fix                                                  |
|------------------------------|------------------------------------------------------|
| `command not found: node`    | `brew install node`                                  |
| MongoDB connection error     | Check MONGODB_URI in backend/.env                    |
| Port 3000 in use             | `lsof -ti:3000 \| xargs kill -9`                     |
| Port 5173 in use             | `lsof -ti:5173 \| xargs kill -9`                     |
| Permission denied on start.sh| `chmod +x start.sh`                                 |

## License

MIT License - see [LICENSE](LICENSE) file.

## Support

- Documentation: [docs/](docs/)
- Issues: GitHub Issues
- Email: support@eventmanagement.edu

## Acknowledgments

Built with modern best practices for educational institutions.

---

**Production Checklist**: See [docs/ProductionChecklist.md](docs/ProductionChecklist.md) before deploying.
