# Quick Start Guide

## Setup in 5 Minutes

### 1. Database Setup

Ensure PostgreSQL is running and create a database:

```sql
CREATE DATABASE cybernauts_db;
```

### 2. Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm run db:generate
npm run db:migrate
npm run db:seed  # Optional: seed with sample data
npm run dev
```

Backend runs on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Verify Installation

1. Open `http://localhost:3000`
2. You should see the graph visualization
3. Try creating a user from the user panel
4. Try dragging a hobby from the sidebar onto a user node
5. Try connecting users by dragging from one node to another

## Common Issues

**Backend won't start:**
- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Run `npm run db:migrate` again

**Frontend can't connect to backend:**
- Ensure backend is running on port 3001
- Check browser console for errors
- Verify proxy in `vite.config.ts`

**Database errors:**
- Run `npm run db:generate` to regenerate Prisma client
- Run `npm run db:migrate` to apply migrations

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Run `npm test` in backend to verify tests pass

