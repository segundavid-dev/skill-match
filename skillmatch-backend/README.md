# SkillMatch Backend API 🌱

> Production-ready REST + WebSocket backend for **SkillMatch** — Tinder for volunteering & skills matching.

[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-darkblue)](https://prisma.io)
[![Socket.io](https://img.shields.io/badge/Socket.io-4-black)](https://socket.io)

---

## 📁 Project structure

```
skillmatch-backend/
├── prisma/
│   ├── schema.prisma          ← 11-model data schema
│   └── seed.ts                ← Sample data (5 volunteers, 3 orgs, 8 opportunities)
├── src/
│   ├── index.ts               ← App entry — Express + HTTP + Socket.io bootstrap
│   ├── config/
│   │   ├── env.ts             ← Typed environment config
│   │   ├── prisma.ts          ← Prisma client singleton
│   │   ├── redis.ts           ← Redis client + key helpers
│   │   ├── cloudinary.ts      ← Cloudinary config
│   │   └── swagger.ts         ← Full OpenAPI 3.0 spec
│   ├── controllers/           ← Request handlers (thin layer, call services)
│   │   ├── auth.controller.ts
│   │   ├── volunteer.controller.ts
│   │   ├── org.controller.ts
│   │   ├── opportunity.controller.ts
│   │   ├── swipe.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── participation.controller.ts
│   │   └── rating.controller.ts
│   ├── services/              ← Business logic
│   │   ├── auth.service.ts
│   │   ├── matching.service.ts   ← ⭐ Core algorithm
│   │   └── swipe.service.ts      ← Mutual match detection
│   ├── routes/                ← Express routers with Zod validation
│   │   ├── auth.routes.ts
│   │   ├── volunteer.routes.ts
│   │   ├── org.routes.ts
│   │   ├── opportunity.routes.ts
│   │   ├── swipe.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── participation.routes.ts
│   │   └── rating.routes.ts
│   ├── middleware/
│   │   ├── auth.ts            ← JWT authenticate + role guards
│   │   ├── validate.ts        ← Zod request validation
│   │   ├── rateLimiter.ts     ← General, auth, swipe rate limiters
│   │   └── errorHandler.ts    ← Global error handler
│   ├── sockets/
│   │   └── index.ts           ← Socket.io: chat, typing, presence, match events
│   ├── jobs/
│   │   └── index.ts           ← BullMQ workers (match suggestions, email digest)
│   ├── utils/
│   │   ├── logger.ts          ← Winston logger
│   │   ├── response.ts        ← Standardised API responses
│   │   ├── jwt.ts             ← Token signing & verification
│   │   ├── email.ts           ← Nodemailer + HTML templates
│   │   └── upload.ts          ← Multer + Cloudinary streaming
│   └── types/
│       └── express.d.ts       ← Extend Request with user
├── tests/
│   ├── unit/
│   │   ├── matching.service.test.ts
│   │   └── response.util.test.ts
│   └── integration/
│       └── auth.test.ts
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for Postgres + Redis)

### 1 — Clone & install
```bash
git clone https://github.com/your-org/skillmatch-backend.git
cd skillmatch-backend
npm install
```

### 2 — Configure environment
```bash
cp .env.example .env
# Fill in your values — minimum required for local dev:
# DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
```

### 3 — Start infrastructure
```bash
docker-compose up postgres redis -d
```

### 4 — Run migrations & seed
```bash
npm run db:generate    # generate Prisma client
npm run db:migrate     # apply migrations
npm run db:seed        # load sample data
```

### 5 — Start dev server
```bash
npm run dev
```

The API will be running at:
- **REST API** → `http://localhost:4000/api`
- **API Docs** → `http://localhost:4000/api/docs`
- **Health**   → `http://localhost:4000/health`

---

## 🐳 Docker (full stack)

```bash
cp .env.example .env   # fill in secrets
docker-compose up --build
```

---

## 🧪 Tests

```bash
npm test               # run all tests
npm run test:watch     # watch mode
npm run test:coverage  # with coverage report
```

---

## 📡 REST API reference

All responses follow:
```json
{
  "success": true,
  "message": "Human readable string",
  "data": { ... },
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

### Authentication

| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/auth/register` | `{ email, password, role }` | — |
| POST | `/api/auth/login` | `{ email, password }` | — |
| GET | `/api/auth/verify-email?token=` | — | — |
| POST | `/api/auth/refresh-token` | `{ refreshToken }` | — |
| POST | `/api/auth/logout` | `{ refreshToken }` | — |
| POST | `/api/auth/forgot-password` | `{ email }` | — |
| POST | `/api/auth/reset-password` | `{ token, password }` | — |
| GET | `/api/auth/me` | — | ✅ |

### Volunteer Profiles

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/volunteer/profile` | Create (volunteer only) |
| GET | `/api/volunteer/profile` | Get my profile |
| PUT | `/api/volunteer/profile` | Update |
| POST | `/api/volunteer/profile/avatar` | Upload avatar (multipart) |
| GET | `/api/volunteer/profile/:id` | Public profile |
| GET | `/api/volunteer/profile/:id/ratings` | Ratings for volunteer |

### Organization Profiles

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/org/profile` | Create (org only) |
| GET | `/api/org/profile` | My profile |
| PUT | `/api/org/profile` | Update |
| POST | `/api/org/profile/logo` | Upload logo |
| GET | `/api/org/profile/:id` | Public profile |

### Opportunities

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/opportunities` | List (public, filterable) |
| GET | `/api/opportunities/:id` | Detail |
| POST | `/api/opportunities` | Create (org only) |
| PUT | `/api/opportunities/:id` | Update |
| DELETE | `/api/opportunities/:id` | Delete |
| GET | `/api/opportunities/me/list` | My org's opportunities |

**Query params for GET /api/opportunities:**
- `status` — ACTIVE | DRAFT | CLOSED | FILLED
- `locationType` — REMOTE | IN_PERSON | HYBRID
- `skillId` — filter by required skill
- `search` — full-text search on title/description
- `page`, `limit`

### Swiping & Matching ⭐

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/swipe` | Swipe LEFT or RIGHT |
| GET | `/api/swipe/feed` | Ranked opportunities for volunteer |
| GET | `/api/swipe/matches` | My matches (filterable by status) |

**POST /api/swipe body:**
```json
{
  "opportunityId": "clxxxx",
  "direction": "RIGHT",
  "volunteerId": "clxxxx"   // required when org swipes
}
```

**Response when mutual match:**
```json
{
  "success": true,
  "message": "🎉 It's a Match!",
  "data": {
    "isMutualMatch": true,
    "match": {
      "id": "clxxxx",
      "matchScore": 94,
      "explanation": "Exceptional match — Coding + Data Analysis align perfectly",
      "chatRoomId": "clxxxx"
    }
  }
}
```

### Chat

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/chats` | My chat rooms |
| GET | `/api/chats/:roomId/messages` | Paginated messages |
| POST | `/api/chats/:roomId/messages` | REST fallback for sending |

### Dashboard

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/dashboard/volunteer` | Stats, upcoming, streak |
| GET | `/api/dashboard/org` | Opportunities, fill rate, matches |

### Participation

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/participation/confirm` | Confirm (requires mutual match) |
| GET | `/api/participation/mine` | My participations |
| PATCH | `/api/participation/:id/complete` | Mark complete (org/admin) |

### Ratings

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/rating/submit` | Submit 1–5 star rating |
| GET | `/api/rating/profiles/:id` | Ratings for user |
| GET | `/api/rating/skills` | List all skills (searchable) |

---

## 🔌 WebSocket events (Socket.io)

### Connection
```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:4000', {
  auth: { token: 'YOUR_ACCESS_TOKEN' }
});
```

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `roomId: string` | Join a chat room |
| `leaveRoom` | `roomId: string` | Leave a room |
| `sendMessage` | `{ roomId, content }` | Send a message |
| `typing` | `{ roomId, isTyping }` | Typing indicator |
| `markRead` | `{ roomId }` | Mark messages as read |
| `confirmOpportunity` | `{ roomId, opportunityId }` | Signal confirmation |
| `heartbeat` | — | Keep online status alive |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `newMessage` | `Message` | New message in room |
| `userTyping` | `{ userId, isTyping }` | Typing indicator |
| `messagesRead` | `{ roomId, readBy }` | Read receipt |
| `new_match` | `{ match, event: 'match_confetti' }` | Mutual match notification |
| `onlineStatus` | `{ userId, online }` | Presence update |
| `opportunityConfirmed` | `{ opportunityId, confirmedBy }` | Participation confirmed |
| `error` | `{ message }` | Error response |

---

## 🧠 Matching algorithm

The `calculateMatchScore` function scores volunteer → opportunity fit:

| Factor | Weight | How it's calculated |
|--------|--------|---------------------|
| **Skill overlap** | 80% | `matched_skills / required_skills × 100` |
| **Availability** | 10% | Flexible = 100, any = 70, none = 30 |
| **Location** | 5% | Remote = 100, same city = 100, different = 40 |
| **Past ratings** | 5% | Average stars × 20, capped at 100 |

Returns a score 0–100 with a human-readable explanation:
- **≥90** → "Exceptional match — Coding + Teaching align perfectly"
- **≥75** → "Great fit — shared skills and compatible availability"
- **≥60** → "Good potential — some alignment"
- **<60** → "Partial match — relevant experience but some gaps"

---

## 🔐 Security features

- **Helmet** — HTTP security headers
- **CORS** — Origin whitelisting
- **Rate limiting** — General (100/15min), Auth (10/15min), Swipe (200/hour)
- **Zod** — Schema validation on all inputs
- **bcrypt** — Password hashing (12 salt rounds)
- **JWT rotation** — Refresh tokens rotate on every use
- **Prisma** — Parameterised queries (SQL injection safe)
- **10kb** body size limit — prevents payload attacks

---

## 🌐 Environment variables

See `.env.example` for all variables. Minimum required:

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/skillmatch_db
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=change-me-in-production
JWT_REFRESH_SECRET=change-me-in-production
CLIENT_URL=http://localhost:3000
```

---

## 🗄️ Database models

| Model | Description |
|-------|-------------|
| `User` | Auth entity — email, password, role |
| `VolunteerProfile` | Skills, bio, location, availability, impact score |
| `OrganizationProfile` | Name, mission, cause tags, verified badge |
| `Skill` | Lookup table — many-to-many with volunteers & opportunities |
| `Opportunity` | Posted by org — skills, location, dates, spots |
| `Swipe` | Who swiped what direction on what |
| `Match` | Volunteer + Opportunity + score + status |
| `ChatRoom` | Created on mutual match |
| `Message` | Chat messages with read receipts |
| `Participation` | Confirmed attendance tracking |
| `Rating` | Post-completion 1–5 star reviews |
| `RefreshToken` | Persisted + rotated refresh tokens |

---

## 📝 Seed accounts

After `npm run db:seed`, these accounts are available (password: `Password123!`):

| Email | Role |
|-------|------|
| `alex@example.com` | Volunteer (Coding, Data Analysis) |
| `fatima@example.com` | Volunteer (Graphic Design, Social Media) |
| `chidi@example.com` | Volunteer (Teaching, Mentoring) |
| `amara@example.com` | Volunteer (Writing, Translation) |
| `samuel@example.com` | Volunteer (Photography, Event Planning) |
| `admin@greenearth.org` | Organization |
| `admin@brightminds.org` | Organization |
| `admin@healthbridge.org` | Organization |

---

## 🚢 Deploy

### Vercel / Railway / Render
```bash
npm run build
node dist/index.js
```

### Environment for production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=<strong-random-64-char-string>
JWT_REFRESH_SECRET=<another-strong-random-64-char-string>
CLIENT_URL=https://your-frontend.com
```

---

## 📄 License

MIT
