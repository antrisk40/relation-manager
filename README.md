# Cybernauts Development Assignment

## Interactive User Relationship & Hobby Network

A full-stack application that manages users and their relationships, visualized as a dynamic graph using React Flow.

## 🚀 Features

### Backend
- RESTful API with Express + TypeScript
- PostgreSQL database with Prisma ORM
- User CRUD operations
- Relationship management (link/unlink users)
- Popularity score calculation based on friendships and shared hobbies
- Business logic validation:
  - Prevent deletion of users with active friendships
  - Prevent circular/duplicate friendships
  - Self-friendship prevention
- Comprehensive error handling and validation
- API tests for core business logic

### Frontend
- React + TypeScript with Vite
- Interactive graph visualization using React Flow
- Custom node types (HighScoreNode, LowScoreNode) with animations
- Drag-and-drop hobbies from sidebar to user nodes
- User management panel with form validation
- Real-time popularity score updates
- Undo/redo functionality for node movements
- Responsive UI with loading states and error handling
- Toast notifications for user feedback

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `env.example.txt`):
```bash
cp env.example.txt .env
```

4. Update `.env` with your database credentials:
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/cybernauts_db?schema=public"
NODE_ENV=development
```

5. Generate Prisma client:
```bash
npm run db:generate
```

6. Run database migrations:
```bash
npm run db:migrate
```

7. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to proxy):
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
npm test
```

Tests cover:
- Popularity score calculation
- Relationship management (link/unlink)
- Deletion rules
- Circular friendship prevention

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Users

- `GET /api/users` - Fetch all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
  ```json
  {
    "username": "string",
    "age": "number",
    "hobbies": ["string"]
  }
  ```
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Relationships

- `POST /api/users/:id/link` - Create friendship
  ```json
  {
    "friendId": "uuid"
  }
  ```
- `DELETE /api/users/:id/unlink` - Remove friendship
  ```json
  {
    "friendId": "uuid"
  }
  ```

#### Graph

- `GET /api/graph` - Get graph data (nodes + edges)

### Response Format

```json
{
  "id": "uuid",
  "username": "string",
  "age": "number",
  "hobbies": ["string"],
  "friends": ["uuid"],
  "createdAt": "datetime",
  "popularityScore": "number"
}
```

### Error Responses

- `400` - Validation errors
- `404` - Not found
- `409` - Conflict (e.g., username exists, friendship exists, cannot delete)
- `500` - Internal server error

## 🎯 Business Logic

### Popularity Score Formula
```
popularityScore = number of unique friends + (total hobbies shared with friends × 0.5)
```

### Deletion Rules
- A user cannot be deleted while still connected as a friend to others
- Must unlink all relationships before deletion

### Friendship Rules
- Prevent A → B and B → A from being stored as separate links (treated as one mutual connection)
- Users cannot be friends with themselves

## 🎨 Frontend Features

### Graph Visualization
- Nodes represent users
- Node size and color intensity reflect popularity score
- Green nodes: popularity score > 5
- Blue nodes: popularity score ≤ 5
- Animated edges for relationships
- Drag nodes to reposition
- Connect nodes by dragging from one to another

### Sidebar
- List of all available hobbies
- Search/filter functionality
- Drag hobbies onto user nodes to add them

### User Management Panel
- Create/Edit user form
- Validation for required fields
- Add/remove hobbies
- Delete users (with confirmation)
- Undo/Redo for node movements

## 🏗️ Project Structure

```
cybernauls assignment/
├── backend/
│   ├── src/
│   │   ├── __tests__/         # API and service tests
│   │   ├── routes/            # Express routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── prisma/            # Prisma client
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── nodes/         # Custom React Flow nodes
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand state management
│   │   └── types/             # TypeScript types
│   └── package.json
└── README.md
```

## 🚀 Deployment

### Backend (Example: Railway/Render)

1. Set environment variables:
   - `DATABASE_URL`
   - `PORT`
   - `NODE_ENV`

2. Build:
```bash
npm run build
```

3. Start:
```bash
npm start
```

### Frontend (Example: Vercel)

1. Set environment variable:
   - `VITE_API_URL` (your backend URL)

2. Build:
```bash
npm run build
```

3. Deploy the `dist` folder

## 🎯 Bonus Features Implemented

- ✅ Custom React Flow node types (HighScoreNode, LowScoreNode)
- ✅ Smooth animations when node type changes
- ✅ Undo/redo functionality for node movements
- ✅ Debounced API calls for better performance
- ✅ Lazy loading for graph data
- ✅ Development mode with hot reload (nodemon/ts-node-dev)
- ✅ Comprehensive test coverage for business logic

## 📝 Notes

- The popularity score recalculates automatically when relationships or hobbies change
- Graph updates dynamically when data changes
- Node positions persist during drag operations
- All API calls include proper error handling and user feedback

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Run `npm run db:migrate` to ensure schema is up to date

### Frontend Not Connecting to Backend
- Check that backend is running on port 3001
- Verify proxy settings in `vite.config.ts`
- Check CORS settings if accessing from different origin

### Port Conflicts
- Backend: Change PORT in `.env`
- Frontend: Modify `vite.config.ts` server.port

## 📄 License

This project is part of the Cybernauts Development Assignment.

---

**Submission Date:** [Current Date]
**Developer:** [Your Name]

