import { PrismaClient } from '@prisma/client';
import * as userService from '../services/userService';
import prisma from '../prisma/client';

describe('UserService', () => {
  let testUserId1: string;
  let testUserId2: string;
  let testUserId3: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.friendship.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.friendship.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Create test users
    const user1 = await prisma.user.create({
      data: {
        username: `test_user_${Date.now()}_1`,
        age: 25,
        hobbies: ['reading', 'coding']
      }
    });
    const user2 = await prisma.user.create({
      data: {
        username: `test_user_${Date.now()}_2`,
        age: 30,
        hobbies: ['coding', 'gaming']
      }
    });
    const user3 = await prisma.user.create({
      data: {
        username: `test_user_${Date.now()}_3`,
        age: 28,
        hobbies: ['reading', 'gaming', 'music']
      }
    });

    testUserId1 = user1.id;
    testUserId2 = user2.id;
    testUserId3 = user3.id;
  });

  afterEach(async () => {
    await prisma.friendship.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('Popularity Score Calculation', () => {
    test('should calculate popularity score correctly with friends and shared hobbies', async () => {
      // Create friendships: user1 <-> user2, user1 <-> user3
      await userService.linkUsers(testUserId1, testUserId2);
      await userService.linkUsers(testUserId1, testUserId3);

      const user = await userService.getUserById(testUserId1);

      // user1 has 2 friends
      // user1 hobbies: ['reading', 'coding']
      // user2 hobbies: ['coding', 'gaming'] -> shared: 'coding' (1 hobby)
      // user3 hobbies: ['reading', 'gaming', 'music'] -> shared: 'reading' (1 hobby)
      // Total shared: 2 hobbies
      // Expected score: 2 (friends) + (2 * 0.5) = 2 + 1 = 3

      expect(user).not.toBeNull();
      expect(user?.popularityScore).toBe(3);
    });

    test('should return 0 for user with no friends', async () => {
      const user = await userService.getUserById(testUserId1);
      expect(user?.popularityScore).toBe(0);
    });
  });

  describe('Relationship Management', () => {
    test('should prevent circular/duplicate friendships', async () => {
      // Create friendship user1 -> user2
      await userService.linkUsers(testUserId1, testUserId2);

      // Try to create duplicate (same direction)
      await expect(
        userService.linkUsers(testUserId1, testUserId2)
      ).rejects.toThrow('Friendship already exists');

      // Try to create reverse direction (should also fail)
      await expect(
        userService.linkUsers(testUserId2, testUserId1)
      ).rejects.toThrow('Friendship already exists');
    });

    test('should prevent self-friendship', async () => {
      await expect(
        userService.linkUsers(testUserId1, testUserId1)
      ).rejects.toThrow('cannot be friends with themselves');
    });
  });

  describe('Deletion Rules', () => {
    test('should prevent deletion of user with existing friendships', async () => {
      // Create friendship
      await userService.linkUsers(testUserId1, testUserId2);

      // Try to delete user1 (has friendship)
      await expect(
        userService.deleteUser(testUserId1)
      ).rejects.toThrow('Cannot delete user with existing friendships');

      // Unlink first
      await userService.unlinkUsers(testUserId1, testUserId2);

      // Now deletion should succeed
      await expect(userService.deleteUser(testUserId1)).resolves.not.toThrow();
    });

    test('should allow deletion of user without friendships', async () => {
      await expect(userService.deleteUser(testUserId1)).resolves.not.toThrow();
      const user = await userService.getUserById(testUserId1);
      expect(user).toBeNull();
    });
  });

  describe('Unlink Functionality', () => {
    test('should successfully unlink users', async () => {
      await userService.linkUsers(testUserId1, testUserId2);
      
      const userBefore = await userService.getUserById(testUserId1);
      expect(userBefore?.friends).toContain(testUserId2);

      await userService.unlinkUsers(testUserId1, testUserId2);

      const userAfter = await userService.getUserById(testUserId1);
      expect(userAfter?.friends).not.toContain(testUserId2);
    });

    test('should throw error when unlinking non-existent friendship', async () => {
      await expect(
        userService.unlinkUsers(testUserId1, testUserId2)
      ).rejects.toThrow('Friendship does not exist');
    });
  });
});

