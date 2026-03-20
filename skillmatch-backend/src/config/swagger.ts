import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillMatch API',
      version: '1.0.0',
      description:
        'Production-ready REST + WebSocket API for SkillMatch — Tinder for volunteering & skills matching.',
      contact: { name: 'SkillMatch Team', email: 'api@skillmatch.io' },
    },
    servers: [
      { url: `http://localhost:${env.port}`, description: 'Development' },
      { url: 'https://api.skillmatch.io', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email: { type: 'string', format: 'email', example: 'alex@example.com' },
            password: { type: 'string', minLength: 8, example: 'Password123!' },
            role: { type: 'string', enum: ['VOLUNTEER', 'ORGANIZATION'] },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        SwipeRequest: {
          type: 'object',
          required: ['opportunityId', 'direction'],
          properties: {
            opportunityId: { type: 'string' },
            volunteerId: { type: 'string', description: 'Required when org swipes on a volunteer' },
            direction: { type: 'string', enum: ['LEFT', 'RIGHT'] },
          },
        },
        VolunteerProfile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string', example: 'Alex Johnson' },
            bio: { type: 'string' },
            location: { type: 'string', example: 'Lagos, Nigeria' },
            availability: {
              type: 'array',
              items: { type: 'string', enum: ['weekdays', 'weekends', 'evenings', 'flexible'] },
            },
            causes: { type: 'array', items: { type: 'string' } },
            impactScore: { type: 'number' },
            skills: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, name: { type: 'string' } } } },
          },
        },
        Opportunity: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string', example: 'STEM Tutor for After-School Program' },
            description: { type: 'string' },
            locationType: { type: 'string', enum: ['REMOTE', 'IN_PERSON', 'HYBRID'] },
            location: { type: 'string' },
            spotsNeeded: { type: 'integer' },
            impactMetric: { type: 'string', example: '200 students impacted' },
            org: { $ref: '#/components/schemas/OrgProfile' },
            requiredSkills: { type: 'array', items: { type: 'object' } },
          },
        },
        OrgProfile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Green Earth Foundation' },
            logo: { type: 'string' },
            mission: { type: 'string' },
            verifiedBadge: { type: 'boolean' },
            causeTags: { type: 'array', items: { type: 'string' } },
          },
        },
        Match: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            matchScore: { type: 'number', example: 94 },
            status: { type: 'string', enum: ['PENDING', 'MUTUAL', 'ACCEPTED', 'REJECTED'] },
            scoreBreakdown: {
              type: 'object',
              properties: {
                skillOverlap: { type: 'number' },
                availability: { type: 'number' },
                location: { type: 'number' },
                pastRatings: { type: 'number' },
                total: { type: 'number' },
                explanation: { type: 'string', example: 'Exceptional match — Coding + Teaching align perfectly' },
                matchedSkills: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            content: { type: 'string' },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            sender: { type: 'object' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & authorization' },
      { name: 'Volunteer', description: 'Volunteer profile management' },
      { name: 'Organization', description: 'Organization profile management' },
      { name: 'Opportunities', description: 'Opportunity CRUD' },
      { name: 'Swipe', description: 'Core swiping & matching feed' },
      { name: 'Chat', description: 'Messaging between matched users' },
      { name: 'Dashboard', description: 'User dashboards & stats' },
      { name: 'Participation', description: 'Opportunity participation management' },
      { name: 'Ratings', description: 'Post-opportunity feedback' },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: {
            201: { description: 'Account created. Verification email sent.' },
            409: { description: 'Email already in use' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Log in and receive JWT tokens',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: { description: 'Login successful — returns accessToken + refreshToken' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/auth/refresh-token': {
        post: {
          tags: ['Auth'], summary: 'Rotate refresh token',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } },
          responses: { 200: { description: 'New token pair issued' } },
        },
      },
      '/api/auth/logout': {
        post: { tags: ['Auth'], summary: 'Invalidate refresh token', responses: { 200: { description: 'Logged out' } } },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'], summary: 'Get current user', security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Current user payload' } },
        },
      },
      '/api/volunteer/profile': {
        post: {
          tags: ['Volunteer'], summary: 'Create volunteer profile (step 1 of onboarding)', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/VolunteerProfile' } } } },
          responses: { 201: { description: 'Profile created' } },
        },
        get: {
          tags: ['Volunteer'], summary: 'Get my volunteer profile', security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Volunteer profile' } },
        },
        put: {
          tags: ['Volunteer'], summary: 'Update my volunteer profile', security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile updated' } },
        },
      },
      '/api/swipe': {
        post: {
          tags: ['Swipe'], summary: 'Swipe LEFT or RIGHT on an opportunity or volunteer', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SwipeRequest' } } } },
          responses: {
            200: { description: 'Swipe recorded. Returns isMutualMatch=true when both sides match.' },
          },
        },
      },
      '/api/swipe/feed': {
        get: {
          tags: ['Swipe'], summary: 'Get ranked opportunity feed for volunteer', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }],
          responses: { 200: { description: 'Ranked opportunities with match scores' } },
        },
      },
      '/api/swipe/matches': {
        get: {
          tags: ['Swipe'], summary: 'Get my matches', security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['PENDING', 'MUTUAL', 'ACCEPTED'] } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'List of matches' } },
        },
      },
      '/api/chats': {
        get: {
          tags: ['Chat'], summary: 'Get all my chat rooms', security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Chat rooms with last message' } },
        },
      },
      '/api/chats/{roomId}/messages': {
        get: {
          tags: ['Chat'], summary: 'Get messages in a room', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Paginated messages' } },
        },
        post: {
          tags: ['Chat'], summary: 'Send a message (REST fallback)', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { content: { type: 'string' } } } } } },
          responses: { 201: { description: 'Message sent' } },
        },
      },
      '/api/dashboard/volunteer': {
        get: {
          tags: ['Dashboard'], summary: 'Volunteer dashboard — stats, upcoming, matches', security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Dashboard data' } },
        },
      },
      '/api/dashboard/org': {
        get: {
          tags: ['Dashboard'], summary: 'Organization dashboard — opportunities, fill rate, recent matches', security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Org dashboard data' } },
        },
      },
      '/api/participation/confirm': {
        post: {
          tags: ['Participation'], summary: 'Confirm participation in an opportunity', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { opportunityId: { type: 'string' } } } } } },
          responses: { 201: { description: 'Participation confirmed' } },
        },
      },
      '/api/rating/submit': {
        post: {
          tags: ['Ratings'], summary: 'Submit a 1–5 star rating after an opportunity', security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object', required: ['toUserId', 'stars'],
                  properties: { toUserId: { type: 'string' }, stars: { type: 'integer', minimum: 1, maximum: 5 }, feedback: { type: 'string' } },
                },
              },
            },
          },
          responses: { 201: { description: 'Rating submitted' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
