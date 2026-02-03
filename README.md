# Specialist Admin Portal

Admin panel for managing the Specialist platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Features

### ✅ Implemented (Fase 1)

- **Authentication**
  - Login page with form validation
  - JWT token management
  - Admin role verification
  - Protected routes

- **Layout**
  - Sidebar navigation
  - Header with user info and logout
  - Responsive design

- **Integration**
  - React Query for data fetching
  - Axios API client with interceptors
  - Shared types from `@specialist/shared`

## Project Structure

```
specialist-admin/
├── app/
│   ├── admin/
│   │   ├── login/          # Login page
│   │   ├── dashboard/      # Dashboard (placeholder)
│   │   └── layout.tsx      # Admin layout with protection
│   └── ...
├── components/
│   └── admin/
│       ├── sidebar.tsx     # Navigation sidebar
│       └── header.tsx      # Top header
├── hooks/
│   └── use-admin-auth.ts   # Auth hook with React Query
└── lib/
    └── api.ts              # API client configuration
```

## Development

- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`

## Next Steps

- [ ] Dashboard with real metrics
- [ ] User management (CRUD)
- [ ] Request management
- [ ] Professional/Company profiles management
