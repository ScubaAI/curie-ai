# Curie Project Structure

## Root Directory
```
curie/
├── .env                          # Environment variables (DB, JWT, API keys)
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── postcss.config.mjs
├── vercel.json
├── README.md
│
├── prisma/
│   ├── schema.prisma            # Database schema with User, Patient, Doctor models
│   └── seed.ts                  # Database seeding script
│
├── src/
│   ├── middleware.ts            # Auth middleware for route protection
│   │
│   ├── app/
│   │   ├── layout.tsx           # Root layout with AuthProvider
│   │   ├── page.tsx             # Landing page
│   │   ├── globals.css
│   │   │
│   │   ├── (auth)/              # Auth route group (no /auth prefix in URL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Login page → /login
│   │   │   ├── register/
│   │   │   │   └── page.tsx     # Register page → /register
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (patient)/           # Patient route group (no /patient prefix in URL)
│   │   │   ├── overview/
│   │   │   │   └── page.tsx     # Patient dashboard → /overview
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (doctor)/            # Doctor route group (no /doctor prefix in URL)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx     # Doctor dashboard → /dashboard
│   │   │   ├── patient/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx # Patient detail → /patient/[id]
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (onboarding)/        # Onboarding route group
│   │   │   ├── step-1/
│   │   │   │   └── page.tsx     # Onboarding step 1 → /step-1
│   │   │   ├── step-2/
│   │   │   │   └── page.tsx     # → /step-2
│   │   │   ├── step-3/
│   │   │   │   └── page.tsx     # → /step-3
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── page.tsx
│   │   │   ├── dashboard/
│   │   │   ├── measurement/
│   │   │   └── ... (8 total files/folders)
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts      # POST /api/auth/login
│   │       │   ├── logout/
│   │       │   │   └── route.ts      # POST /api/auth/logout
│   │       │   ├── me/
│   │       │   │   └── route.ts      # GET /api/auth/me
│   │       │   ├── refresh/
│   │       │   │   └── route.ts      # POST /api/auth/refresh
│   │       │   ├── register/
│   │       │   │   └── route.ts      # POST /api/auth/register
│   │       │   └── withings/
│   │       │       ├── route.ts
│   │       │       └── callback/
│   │       │           └── route.ts
│   │       └── ... (26 total API routes)
│   │
│   ├── components/              # React components
│   │   ├── admin/
│   │   ├── shared/
│   │   └── ... (various UI components)
│   │
│   ├── hooks/
│   │   └── useAuth.tsx          # Auth context provider
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── password.ts      # Password hashing/verification
│   │   │   └── session.ts       # JWT token management
│   │   ├── prisma.ts            # Prisma client instance
│   │   ├── crypto.ts
│   │   ├── encryption.ts
│   │   ├── storage.ts
│   │   ├── withings.ts
│   │   ├── mappers/
│   │   └── sync/
│   │
│   ├── types/                   # TypeScript type definitions
│   │
│   └── services/                # Business logic services
│
├── public/                      # Static assets
│   ├── videos/
│   └── ... (images, icons)
│
└── node_modules/                # Dependencies
```

## Key Routes Mapping

### Public Routes (No Auth Required)
- `/` → Landing page
- `/login` → Login page
- `/register` → Registration page

### Patient Routes (PATIENT role only)
- `/overview` → Patient dashboard (src/app/(patient)/overview/page.tsx)
- `/step-1`, `/step-2`, `/step-3` → Onboarding steps

### Doctor Routes (DOCTOR/ADMIN role only)
- `/dashboard` → Doctor dashboard (src/app/(doctor)/dashboard/page.tsx)
- `/patient/[id]` → Patient detail view

### Admin Routes (ADMIN role only)
- `/admin` → Admin dashboard
- `/admin/dashboard`
- `/admin/measurement`

### API Routes
- `POST /api/auth/login` → User login
- `POST /api/auth/logout` → User logout
- `POST /api/auth/register` → User registration
- `POST /api/auth/refresh` → Refresh access token
- `GET /api/auth/me` → Get current user session
- `GET /api/auth/withings` → Withings OAuth
- `GET /api/auth/withings/callback` → Withings OAuth callback

## Authentication Flow

1. User submits login form → `POST /api/auth/login`
2. Server validates credentials, generates JWT tokens
3. Tokens stored in httpOnly cookies (`access_token`, `refresh_token`)
4. Server returns redirect URL based on user role
5. Client redirects to appropriate dashboard
6. Middleware (`src/middleware.ts`) protects routes on subsequent requests
7. `GET /api/auth/me` checks session validity

## Database Models (Prisma)

- **User** - Core user account (email, password, role)
- **Patient** - Patient-specific data (demographics, goals, onboarding status)
- **Doctor** - Doctor-specific data (license, specialty, clinic info)
- **Account** - OAuth provider accounts
- **Session** - User sessions
- **WearableConnection** - Connected devices (Withings, Garmin, etc.)
- **Measurement** - Time-series biometric data
- **CompositionRecord** - Body composition from BIA devices
- **LabResult** - Laboratory test results
- **Appointment** - Doctor-patient appointments
- **DoctorNote** - Clinical notes

## Environment Variables (.env)

- `DATABASE_URL` - Prisma Postgres connection
- `DIRECT_URL` - Direct database connection
- `JWT_SECRET` - Access token secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `NEXT_PUBLIC_APP_URL` - Application URL
- `WITHINGS_CLIENT_ID` - Withings OAuth
- `WITHINGS_CLIENT_SECRET` - Withings OAuth
- `TOKEN_ENCRYPTION_KEY` - Token encryption
- `GROQ_API_KEY` - AI API key
