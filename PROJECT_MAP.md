# Curie Project Structure

## Root Directory
```
curie/
├── .env                          # Environment variables (DB, JWT, API keys)
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Database seeding script
│
├── src/
│   ├── middleware.ts            # Auth middleware
│   │
│   ├── app/
│   │   ├── (auth)/              # Login, Register
│   │   ├── (patient)/           # Patient dashboard & Shop
│   │   │   ├── overview/        # /overview
│   │   │   ├── shop/            # /shop
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── [productSlug]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (doctor)/            # Doctor dashboard
│   │   │   ├── dashboard/       # /doctor/dashboard (Main view)
│   │   │   ├── advisor/         # /doctor/advisor (AI Chat)
│   │   │   ├── patients/        # /doctor/patients (List)
│   │   │   └── patient/         # /doctor/patient/[id] (Individual care)
│   │   │       └── [patientId]/
│   │   │           └── overview/# Clinical Overview
│   │   │           └── page.tsx # Detail logic
│   │   │
│   │   ├── (onboarding)/        # Steps 1-3
│   │   └── api/                 # 30+ endpoints (auth, patient, measurements)
│   │       ├── doctor/
│   │       │   └── patients/
│   │       │       └── [patientId]/
│   │       │           └── dashboard/ # GET consolidated clinical data
│   │
│   ├── components/
│   │   ├── patient/
│   │   │   ├── shop/            # WearablesShop, ProductCard, Banner
│   │   │   └── dashboard/       # Patient-facing charts
│   │   ├── doctor/
│   │   │   ├── advisor/         # AdvisorChat
│   │   │   ├── patients/        # PatientList
│   │   │   └── dashboard/       # StatCards
│   │   ├── shared/              # ProductTrustBadges, MetricCard
│   │   └── admin/               # AdvancedMetrics, CompositionTable
│   │
│   ├── lib/
│   │   ├── shop/                # types, mockProducts, recommendation logic
│   │   ├── auth/                # session.ts, doctor-guard.ts
│   │   └── sync/                # wearable syncing logic
│   │
│   ├── services/                # Business logic
│   └── hooks/                   # useAuth, etc.
```

## Key Routes & Connections

### 🏥 Patient Experience
1. **Dashboard Overview** (`/overview`):
   - Displays core health metrics.
   - **Mini-Shop Teaser**: Recommends products based on patient state via `getRecommendedProducts`.
   - Links to **Health Shop** (`/shop`).

2. **Health Shop** (`/shop`):
   - **Main Grid**: Filtering by category (Wearable, Scale, etc.) and brand.
   - **Personalized Banner**: Highlights specific devices for the patient's goals.
   - **Product Detail** (`/shop/[slug]`):
     - Interactive Gallery.
     - Curie Integration Benefits (why it matters for your data).
     - Purchase CTAs (Clip Payment / Official Links).

### 👨‍⚕️ Doctor Experience
1. **Clinical Dashboard** (`/doctor/dashboard`):
   - Population health overview.
   - Recent alerts and critical patient list.

2. **Patient Detail** (`/doctor/patient/[id]/overview`):
   - **Advanced Metrics**: Deep dive into body composition (Phase Angle, SMM/PBF trends).
   - **Clinical Context**: Metric cards with medical alerts (e.g., "Sarcopenia risk").
   - **AI Advisor**: Integrated chat for case analysis.
   - **Protocol Management**: Nutritional and workout plan assignment.

### 🛠️ Technical Stack
- **Frontend**: Next.js 14/15 (App Router), Framer Motion (Animations), Tailwind CSS.
- **Backend**: Prisma (PostgreSQL), Next.js API Routes (Route Handlers).
- **Shop Logic**:
  - `src/lib/shop/getRecommendedProducts.ts`: Heuristic engine for personal suggestions.
  - `src/lib/shop/mockProducts.ts`: Centralized product catalog (Slug-based).
