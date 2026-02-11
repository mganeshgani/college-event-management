# System Architecture

## Overview

The Event Management System is a full-stack web application built with a modern microservices architecture, designed for scalability, security, and maintainability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Browser   │  │   Mobile   │  │   Desktop  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┴────────────────────────────────────┐
│                    Frontend Layer (SPA)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 18 + TypeScript + Vite                        │  │
│  │  ├─ Zustand (State Management)                       │  │
│  │  ├─ React Query (Data Fetching)                      │  │
│  │  ├─ Framer Motion (Animations)                       │  │
│  │  ├─ Tailwind CSS (Styling)                           │  │
│  │  └─ React Router (Navigation)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────┴────────────────────────────────────┐
│                      API Gateway Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js Middleware                                │  │
│  │  ├─ CORS                                              │  │
│  │  ├─ Helmet (Security Headers)                        │  │
│  │  ├─ Rate Limiting                                     │  │
│  │  ├─ Request Validation                                │  │
│  │  └─ JWT Authentication                                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   Application Layer (API)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js + TypeScript + Express                       │  │
│  │  ├─ Auth Controller (JWT, Refresh Tokens)            │  │
│  │  ├─ Activity Controller (CRUD, Search, Filter)       │  │
│  │  ├─ Enrollment Controller (Atomic Transactions)      │  │
│  │  ├─ Dashboard Controller (Analytics)                 │  │
│  │  └─ Export Controller (CSV Generation)               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                     Business Logic Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services & Utilities                                 │  │
│  │  ├─ Email Service (SendGrid)                         │  │
│  │  ├─ Validation Service                                │  │
│  │  ├─ Logger (Winston)                                  │  │
│  │  └─ Error Handler                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                      Data Layer (ORM)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mongoose ODM                                         │  │
│  │  ├─ User Model                                        │  │
│  │  ├─ Activity Model                                    │  │
│  │  └─ Participation Model (Unique Index)               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                     Database Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB 6.x (NoSQL Document Store)                  │  │
│  │  ├─ Collections: users, activities, participations   │  │
│  │  ├─ Indexes: Compound, Text, Single-field            │  │
│  │  └─ Transactions: ACID compliance                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Entity-Relationship Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ _id: ObjectId (PK)  │
│ email: String       │◄───────┐
│ password: String    │        │
│ name: String        │        │ 1:N
│ role: Enum          │        │
│ department: String  │        │
│ rollNumber: String  │        │
│ refreshTokens: []   │        │
│ createdAt: Date     │        │
│ updatedAt: Date     │        │
└─────────────────────┘        │
         │                     │
         │ 1:N                 │
         │                     │
         ▼                     │
┌─────────────────────┐        │
│     Activity        │        │
├─────────────────────┤        │
│ _id: ObjectId (PK)  │        │
│ title: String       │        │
│ description: String │        │
│ startDate: Date     │        │
│ endDate: Date       │        │
│ location: String    │        │
│ capacity: Number    │        │
│ availableSlots: Num │        │
│ department: String  │        │
│ category: Enum      │        │
│ posterImage: String │        │
│ createdBy: ObjectId │────────┘
│ status: Enum        │
│ createdAt: Date     │
│ updatedAt: Date     │
└─────────────────────┘
         │
         │ N:M (via Participation)
         │
         ▼
┌──────────────────────┐
│   Participation      │
├──────────────────────┤
│ _id: ObjectId (PK)   │
│ activityId: ObjectId │───┐
│ userId: ObjectId     │───┼─ UNIQUE(activityId, userId)
│ enrolledAt: Date     │   │
│ status: Enum         │   │
└──────────────────────┘   │
                           │
  Unique Compound Index ───┘
  Prevents duplicate enrollments
```

## Data Flow: Enrollment Process

```
┌─────────┐                                    ┌─────────┐
│ Student │                                    │  System │
└────┬────┘                                    └────┬────┘
     │                                              │
     │ 1. Click "Enroll" Button                    │
     ├─────────────────────────────────────────────►
     │                                              │
     │                                    2. Start Transaction
     │                                    3. Lock Activity Doc
     │                                              │
     │                                    4. Check Available Slots
     │                                              │
     │                                    5. Check Duplicate
     │                                       (Unique Index)
     │                                              │
     │                                    6. Decrement Slots
     │                                       (Atomic UPDATE)
     │                                              │
     │                                    7. Create Participation
     │                                              │
     │                                    8. Commit Transaction
     │                                              │
     │                                    9. Send Email (Async)
     │                                              │
     │ 10. Return Success                           │
     ◄─────────────────────────────────────────────┤
     │                                              │
```

## Race Condition Handling

The system uses **MongoDB Transactions** with atomic operations to handle concurrent enrollment attempts:

1. **Transaction Isolation**: Each enrollment starts a session with transaction
2. **Document Locking**: Activity document is locked during update
3. **Atomic Decrement**: `availableSlots` decremented using `$inc` operator
4. **Duplicate Prevention**: Unique compound index on `(activityId, userId)`
5. **Rollback on Failure**: Transaction aborted if any step fails

### Code Flow:
```typescript
START TRANSACTION
  ├─ SELECT ... FOR UPDATE (Lock activity)
  ├─ CHECK availableSlots > 0
  ├─ CHECK no existing participation (unique index)
  ├─ UPDATE availableSlots = availableSlots - 1
  ├─ INSERT participation record
  └─ COMMIT (or ROLLBACK on error)
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast HMR, optimized builds)
- **Styling**: Tailwind CSS + Custom Design System
- **State Management**: Zustand (lightweight, simple API)
- **Data Fetching**: React Query (caching, refetching)
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB 6 (NoSQL)
- **ODM**: Mongoose
- **Authentication**: JWT (Access + Refresh tokens)
- **Email**: SendGrid
- **Logging**: Winston
- **Validation**: Express-Validator + Joi
- **Security**: Helmet, CORS, Rate Limiting, Mongo Sanitize

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Orchestration**: Kubernetes (optional)
- **Monitoring**: Sentry (error tracking)
- **Testing**: Jest (backend), Vitest (frontend), Cypress (E2E)

## Security Measures

1. **Authentication**: JWT with short-lived access tokens (15 min) and refresh tokens (7 days)
2. **Authorization**: Role-based access control (Student, Faculty, Admin)
3. **Input Validation**: All inputs validated and sanitized
4. **Rate Limiting**: API endpoints rate-limited (100 req/min general, 10 req/min enrollment)
5. **HTTPS**: Enforced in production with HSTS
6. **Headers**: Security headers via Helmet (CSP, X-Frame-Options, etc.)
7. **NoSQL Injection**: Input sanitization with mongo-sanitize
8. **Password**: Bcrypt hashing with 12 rounds
9. **CORS**: Configured for specific frontend origin

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API design allows multiple instances
2. **Database Indexing**: Optimized queries with proper indexes
3. **Caching**: React Query caching on frontend, potential Redis for backend
4. **Load Balancing**: Nginx/ALB for distributing traffic
5. **CDN**: Static assets served via CDN
6. **Database Sharding**: MongoDB supports sharding for large datasets
7. **Microservices**: Architecture supports future service extraction

## Deployment Options

1. **Docker Compose** (Development/Small Production)
2. **Kubernetes** (Large-scale Production)
3. **Cloud Platforms**:
   - Backend: Render, Heroku, AWS ECS, Azure App Service
   - Frontend: Vercel, Netlify, AWS S3 + CloudFront
   - Database: MongoDB Atlas

## Monitoring & Logging

- **Application Logs**: Winston (file + console)
- **Error Tracking**: Sentry integration
- **Health Checks**: `/health` endpoints
- **Metrics**: Request duration, error rates, enrollment success rate
- **Alerts**: Configure alerts for critical errors and system downtime
