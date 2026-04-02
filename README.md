# SkillMatch

**Tinder for Volunteering** -- A platform that matches skilled volunteers with community organizations based on skills, availability, location, and cause alignment.

Built for the **TechSolutions Hackathon**, a community-focused hackathon aimed at solving real-world problems through technology. SkillMatch addresses a core challenge in the volunteer space: organizations struggle to find the right volunteers, and volunteers struggle to find meaningful opportunities that match their skills.

---

## Problem

Community organizations spend significant time manually recruiting and vetting volunteers. Meanwhile, skilled individuals who want to give back have no efficient way to discover opportunities that match what they can actually offer. The result is wasted time on both sides and unfilled volunteer positions in communities that need them most.

## Solution

SkillMatch uses a swipe-based matching system (similar to dating apps) combined with a skill-based scoring algorithm to connect volunteers with opportunities. Organizations post what they need, volunteers swipe on what interests them, and the platform handles the matching, scoring, and communication.

### Key Features

- **Swipe-based discovery feed** -- Volunteers browse opportunities with drag-to-swipe interaction, ranked by a weighted match score (skill overlap 80%, availability 10%, location 5%, past ratings 5%)
- **Dual dashboards** -- Separate interfaces for volunteers and organizations with role-specific navigation and data
- **Applicant management** -- Organizations view, accept, or pass on volunteer applicants with real-time status updates and volunteer profile modals
- **Real-time chat** -- Socket.IO powered messaging between matched volunteers and organizations
- **Match notifications** -- Real-time in-app notifications when mutual matches occur
- **Opportunity management** -- Full CRUD for organizations to post, edit, and track volunteer positions with progress bars showing fill rates
- **Volunteer profiles** -- Skills, availability, causes, location, bio, and impact scores visible to organizations

---

## Architecture

SkillMatch is structured as a **monorepo** with two independent packages:

```
SKILLMATCH/
  skillmatch-frontend/    React SPA (Vite + TypeScript)
  skillmatch-backend/     REST API (Express + TypeScript)
```

### Frontend

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Framework   | React 18 with TypeScript         |
| Build tool  | Vite                             |
| Routing     | React Router v7                  |
| HTTP client | Axios                            |
| Real-time   | Socket.IO Client                 |
| Styling     | Inline styles (no CSS framework) |

### Backend

| Layer      | Technology                            |
| ---------- | ------------------------------------- |
| Runtime    | Node.js with TypeScript (tsx)         |
| Framework  | Express 4                             |
| ORM        | Prisma 7 with PostgreSQL adapter      |
| Database   | PostgreSQL (Neon serverless)          |
| Auth       | JWT (access + refresh tokens), bcrypt |
| Validation | Zod                                   |
| Real-time  | Socket.IO                             |
| Security   | Helmet, CORS, express-rate-limit      |
| Logging    | Morgan                                |

### Database Schema

Core models: User, VolunteerProfile, OrganizationProfile, Opportunity, Skill, Swipe, Match, ChatRoom, Message, Participation, Rating.

The matching system uses a compound swipe model (`userId + opportunityId + volunteerId`) to support both volunteer-to-opportunity and organization-to-volunteer swipes. Mutual matches are detected automatically when both parties swipe right, triggering chat room creation and real-time notifications.

---

## Getting Started

### Prerequisites

- Node.js v20+
- PostgreSQL database (or a Neon account)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/segundavid-dev/skill-match.git
cd skill-match
```

2. Install dependencies for both packages:

```bash
cd skillmatch-backend && npm install
cd ../skillmatch-frontend && npm install
```

3. Configure the backend environment. Create `skillmatch-backend/.env`:

```
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:3000

DATABASE_URL=postgresql://...

JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

4. Generate the Prisma client and run migrations:

```bash
cd skillmatch-backend
npx prisma generate
npx prisma migrate deploy
```

5. Seed the database with test data:

```bash
npm run db:seed
```

6. Start both servers:

```bash
# Terminal 1 -- Backend
cd skillmatch-backend && npm run dev

# Terminal 2 -- Frontend
cd skillmatch-frontend && npm run dev
```

### Test Accounts

All seeded accounts use the password `Password123!`

| Role         | Email                  |
| ------------ | ---------------------- |
| Organization | admin@greenearth.org   |
| Organization | admin@brightminds.org  |
| Organization | admin@healthbridge.org |
| Volunteer    | alex@example.com       |
| Volunteer    | fatima@example.com     |
| Volunteer    | chidi@example.com      |

---

## Contributors

| Role                      | GitHub                                              |
| ------------------------- | --------------------------------------------------- |
| Team Lead and Coordinator | [richardxcx](https://github.com/richardxcx)         |
| Developer                 | [dansenpaix](https://github.com/dansenpaix)         |
| Developer                 | [segundavid-dev](https://github.com/segundavid-dev) |

---

## License

This project was built for the TechSolutions Hackathon.
