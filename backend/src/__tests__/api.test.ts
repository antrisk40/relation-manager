import request from 'supertest';
import app from '../server';
import prisma from '../prisma/client';

describe('API Endpoints', () => {
  beforeAll(async () => {
    await prisma.friendship.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.friendship.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('POST /api/users', () => {
    test('should create a new user', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          age: 25,
          hobbies: ['coding', 'reading']
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.username).toBe('testuser');
      expect(response.body.age).toBe(25);
      expect(response.body.hobbies).toEqual(['coding', 'reading']);
      expect(response.body.popularityScore).toBe(0);
    });

    test('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: '',
          age: -5
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/users', () => {
    test('should fetch all users', async () => {
      const response = await request(app).get('/api/users');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /api/users/:id', () => {
    test('should return 409 when trying to delete user with friendships', async () => {
      // Create two users
      const user1Response = await request(app)
        .post('/api/users')
        .send({
          username: 'user1_delete_test',
          age: 25,
          hobbies: ['coding']
        });

      const user2Response = await request(app)
        .post('/api/users')
        .send({
          username: 'user2_delete_test',
          age: 30,
          hobbies: ['reading']
        });

      const user1Id = user1Response.body.id;
      const user2Id = user2Response.body.id;

      // Create friendship
      await request(app)
        .post(`/api/users/${user1Id}/link`)
        .send({ friendId: user2Id });

      // Try to delete user1 (should fail)
      const deleteResponse = await request(app).delete(`/api/users/${user1Id}`);
      expect(deleteResponse.status).toBe(409);

      // Clean up
      await request(app)
        .delete(`/api/users/${user1Id}/unlink`)
        .send({ friendId: user2Id });
      await request(app).delete(`/api/users/${user1Id}`);
      await request(app).delete(`/api/users/${user2Id}`);
    });
  });
});

