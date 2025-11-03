# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication
Currently, no authentication is required for development.

## Endpoints

### Users

#### Get All Users
```http
GET /api/users
```

**Response:**
```json
[
  {
    "id": "uuid",
    "username": "alice",
    "age": 25,
    "hobbies": ["reading", "coding"],
    "friends": ["uuid"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "popularityScore": 3.5
  }
]
```

#### Get User by ID
```http
GET /api/users/:id
```

**Response:**
```json
{
  "id": "uuid",
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "coding"],
  "friends": ["uuid"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "popularityScore": 3.5
}
```

**Error Responses:**
- `404` - User not found

#### Create User
```http
POST /api/users
Content-Type: application/json

{
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "coding"]
}
```

**Validation Rules:**
- `username`: Required, string, min length 1
- `age`: Required, positive integer
- `hobbies`: Required, array of strings, min length 1

**Response:**
```json
{
  "id": "uuid",
  "username": "alice",
  "age": 25,
  "hobbies": ["reading", "coding"],
  "friends": [],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "popularityScore": 0
}
```

**Error Responses:**
- `400` - Validation errors
- `409` - Username already exists

#### Update User
```http
PUT /api/users/:id
Content-Type: application/json

{
  "username": "alice_updated",
  "age": 26,
  "hobbies": ["reading", "coding", "gaming"]
}
```

**All fields are optional.** Only include fields you want to update.

**Response:**
```json
{
  "id": "uuid",
  "username": "alice_updated",
  "age": 26,
  "hobbies": ["reading", "coding", "gaming"],
  "friends": ["uuid"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "popularityScore": 4.0
}
```

**Error Responses:**
- `400` - Validation errors
- `404` - User not found
- `409` - Username already exists

#### Delete User
```http
DELETE /api/users/:id
```

**Response:**
```
204 No Content
```

**Error Responses:**
- `404` - User not found
- `409` - Cannot delete user with existing friendships

### Relationships

#### Create Friendship
```http
POST /api/users/:id/link
Content-Type: application/json

{
  "friendId": "uuid"
}
```

Creates a bidirectional friendship between two users.

**Response:**
```json
{
  "message": "Friendship created successfully"
}
```

**Error Responses:**
- `400` - Invalid friend ID format or user cannot be friends with themselves
- `404` - One or both users not found
- `409` - Friendship already exists

#### Remove Friendship
```http
DELETE /api/users/:id/unlink
Content-Type: application/json

{
  "friendId": "uuid"
}
```

**Response:**
```
204 No Content
```

**Error Responses:**
- `404` - Friendship does not exist

### Graph Data

#### Get Graph Data
```http
GET /api/graph
```

Returns graph data formatted for React Flow visualization.

**Response:**
```json
{
  "nodes": [
    {
      "id": "uuid",
      "username": "alice",
      "age": 25,
      "hobbies": ["reading", "coding"],
      "popularityScore": 3.5
    }
  ],
  "edges": [
    {
      "id": "uuid",
      "source": "user-uuid",
      "target": "friend-uuid"
    }
  ]
}
```

## Error Response Format

```json
{
  "error": "Error message",
  "status": 400,
  "details": [
    {
      "path": ["username"],
      "message": "Username is required"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entries, business rule violations)
- `500` - Internal Server Error

## Popularity Score Calculation

The popularity score is calculated automatically and recalculates when:
- User's hobbies change
- Friendships are created or removed

**Formula:**
```
popularityScore = uniqueFriendsCount + (sharedHobbiesCount × 0.5)
```

Where:
- `uniqueFriendsCount`: Number of unique friends (bidirectional)
- `sharedHobbiesCount`: Sum of shared hobbies with all friends

## Example Usage

### Create Users and Relationships

```bash
# Create user 1
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "age": 25,
    "hobbies": ["reading", "coding"]
  }'

# Create user 2
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "age": 30,
    "hobbies": ["coding", "music"]
  }'

# Link users (use IDs from above responses)
curl -X POST http://localhost:3001/api/users/{user1-id}/link \
  -H "Content-Type: application/json" \
  -d '{"friendId": "{user2-id}"}'

# Get graph data
curl http://localhost:3001/api/graph
```

