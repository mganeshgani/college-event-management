# Event Management System

A comprehensive event management platform for educational institutions with atomic enrollment, role-based access control, and premium UI/UX.

## Features

- **Authentication**: JWT-based auth with role management (Student, Faculty, Admin)
- **Activity Management**: Create, update, and manage events with capacity limits
- **Atomic Enrollment**: Race-condition-safe slot booking with duplicate prevention
- **Dashboards**: Faculty and student dashboards with analytics
- **Export**: CSV export of participant data
- **Email Notifications**: Automated enrollment confirmations
- **Premium UI**: Glass morphism, micro-animations, dark mode support
- **Accessibility**: WCAG 2.1 AA compliant
- **DPDP Compliant**: Privacy-first data handling

## Tech Stack

### Backend
- Node.js + TypeScript + Express
- MongoDB with atomic operations
- JWT authentication
- SendGrid for emails
- Rate limiting and security middleware

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS with custom design system
- Framer Motion for animations
- React Query for data fetching
- Zustand for state management

### DevOps
- Docker & Docker Compose
- GitHub Actions CI/CD
- Kubernetes manifests (optional)
- Sentry for error tracking

## Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB 6+ (or Docker)
- Git

### Environment Setup

1. **Clone the repository**
```bash
git clone <repo-url>
cd Event-Management
```

2. **Backend setup**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

3. **Frontend setup**
```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/event-management
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SENDGRID_API_KEY=your-sendgrid-key
FRONTEND_URL=http://localhost:5173
SENTRY_DSN=your-sentry-dsn
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Event Management System
VITE_ENABLE_DARK_MODE=true
VITE_SENTRY_DSN=your-sentry-dsn
```

## Scripts

### Backend
```bash
npm run dev          # Development with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run integration tests
npm run migrate      # Run database migrations
npm run seed         # Seed sample data
```

### Frontend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run Cypress E2E tests
```

## Project Structure

```
Event-Management/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Helper functions
│   │   ├── types/          # TypeScript types
│   │   └── app.ts          # Express app
│   ├── tests/              # Test files
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # State management
│   │   ├── services/       # API services
│   │   ├── theme/          # Design system
│   │   ├── utils/          # Utilities
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── infra/
│   ├── k8s/                # Kubernetes manifests
│   └── docker-compose.yml
├── scripts/
│   ├── seed.ts             # Database seeding
│   ├── migrate.ts          # Migrations
│   └── export.ts           # Data export
├── docs/
│   ├── API.md              # API documentation
│   ├── Architecture.md     # System architecture
│   ├── DesignNotes.md      # UI/UX guidelines
│   └── Privacy.md          # Privacy policy
└── .github/
    └── workflows/          # CI/CD pipelines
```

## API Documentation

API documentation is available at `/api-docs` when running the backend server.

Key endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/activities` - List activities
- `POST /api/activities` - Create activity (Faculty only)
- `POST /api/activities/:id/enroll` - Enroll in activity
- `GET /api/dashboard/faculty` - Faculty dashboard
- `GET /api/export/:activityId` - Export participants CSV

## Testing

### Unit Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Integration Tests
```bash
cd backend && npm run test:integration
```

### E2E Tests
```bash
# Start services first
docker-compose up -d

# Run Cypress tests
cd frontend && npm run test:e2e
```

## Deployment

### Staging
Push to `develop` branch triggers automatic deployment to staging environment.

### Production
1. Merge to `main` branch
2. CI runs all tests and builds
3. Manual approval required
4. Deploys to production

See [docs/Deployment.md](docs/Deployment.md) for detailed deployment checklist.

## Security

- HTTPS enforced in production
- Helmet.js for security headers
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- JWT token rotation
- CORS configuration
- SQL injection prevention (using Mongoose)
- XSS protection

## Privacy & Compliance

This system is designed to be DPDP Act 2023 compliant:
- Minimal data collection
- Explicit consent for data processing
- Data retention policies (configurable)
- User data export and deletion rights
- Privacy policy included

See [docs/Privacy.md](docs/Privacy.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs/](docs/)
- Issues: GitHub Issues
- Email: support@eventmanagement.edu

## Acknowledgments

Built with modern best practices for educational institutions.

---

**Production Checklist**: See [docs/ProductionChecklist.md](docs/ProductionChecklist.md) before deploying.
