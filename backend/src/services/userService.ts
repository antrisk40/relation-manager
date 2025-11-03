import prisma from '../prisma/client';
import { User, CreateUserDto, UpdateUserDto } from '../types/user';

/**
 * Calculate popularity score for a user
 * Formula: number of unique friends + (total hobbies shared with friends × 0.5)
 */
export async function calculatePopularityScore(userId: string): Promise<number> {
  // Get all friends of the user
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: userId },
        { friendId: userId }
      ]
    },
    include: {
      user: {
        include: {
          friendshipsInitiated: {
            include: { friend: true }
          },
          friendshipsReceived: {
            include: { user: true }
          }
        }
      },
      friend: {
        include: {
          friendshipsInitiated: {
            include: { friend: true }
          },
          friendshipsReceived: {
            include: { user: true }
          }
        }
      }
    }
  });

  // Get unique friend IDs
  const friendIds = new Set<string>();
  friendships.forEach(f => {
    if (f.userId === userId) {
      friendIds.add(f.friendId);
    } else {
      friendIds.add(f.userId);
    }
  });

  const uniqueFriendsCount = friendIds.size;

  // Get user's hobbies
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hobbies: true }
  });

  if (!user) return 0;

  // Calculate shared hobbies
  let totalSharedHobbies = 0;
  const friendUsers = await prisma.user.findMany({
    where: { id: { in: Array.from(friendIds) } },
    select: { hobbies: true }
  });

  friendUsers.forEach(friend => {
    const sharedHobbies = friend.hobbies.filter(hobby => 
      user.hobbies.includes(hobby)
    );
    totalSharedHobbies += sharedHobbies.length;
  });

  return uniqueFriendsCount + (totalSharedHobbies * 0.5);
}

/**
 * Get all users with their popularity scores
 */
export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    include: {
      friendshipsInitiated: true,
      friendshipsReceived: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const usersWithScores = await Promise.all(
    users.map(async (user) => {
      const friendIds = new Set<string>();
      
      user.friendshipsInitiated.forEach(f => friendIds.add(f.friendId));
      user.friendshipsReceived.forEach(f => friendIds.add(f.userId));

      const popularityScore = await calculatePopularityScore(user.id);

      return {
        id: user.id,
        username: user.username,
        age: user.age,
        hobbies: user.hobbies,
        friends: Array.from(friendIds),
        createdAt: user.createdAt,
        popularityScore
      };
    })
  );

  return usersWithScores;
}

/**
 * Get a single user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      friendshipsInitiated: true,
      friendshipsReceived: true
    }
  });

  if (!user) return null;

  const friendIds = new Set<string>();
  user.friendshipsInitiated.forEach(f => friendIds.add(f.friendId));
  user.friendshipsReceived.forEach(f => friendIds.add(f.userId));

  const popularityScore = await calculatePopularityScore(user.id);

  return {
    id: user.id,
    username: user.username,
    age: user.age,
    hobbies: user.hobbies,
    friends: Array.from(friendIds),
    createdAt: user.createdAt,
    popularityScore
  };
}

/**
 * Create a new user
 */
export async function createUser(data: CreateUserDto): Promise<User> {
  const user = await prisma.user.create({
    data: {
      username: data.username,
      age: data.age,
      hobbies: data.hobbies
    }
  });

  return {
    id: user.id,
    username: user.username,
    age: user.age,
    hobbies: user.hobbies,
    friends: [],
    createdAt: user.createdAt,
    popularityScore: 0
  };
}

/**
 * Update a user
 */
export async function updateUser(id: string, data: UpdateUserDto): Promise<User> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      username: data.username,
      age: data.age,
      hobbies: data.hobbies
    },
    include: {
      friendshipsInitiated: true,
      friendshipsReceived: true
    }
  });

  const friendIds = new Set<string>();
  user.friendshipsInitiated.forEach(f => friendIds.add(f.friendId));
  user.friendshipsReceived.forEach(f => friendIds.add(f.userId));

  const popularityScore = await calculatePopularityScore(user.id);

  return {
    id: user.id,
    username: user.username,
    age: user.age,
    hobbies: user.hobbies,
    friends: Array.from(friendIds),
    createdAt: user.createdAt,
    popularityScore
  };
}

/**
 * Delete a user (only if they have no friends)
 */
export async function deleteUser(id: string): Promise<void> {
  // Check if user has any friendships
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { userId: id },
        { friendId: id }
      ]
    }
  });

  if (friendships.length > 0) {
    throw new Error('Cannot delete user with existing friendships. Please unlink all relationships first.');
  }

  await prisma.user.delete({
    where: { id }
  });
}

/**
 * Create a friendship relationship between two users
 * Prevents circular/duplicate friendships
 */
export async function linkUsers(userId: string, friendId: string): Promise<void> {
  if (userId === friendId) {
    throw new Error('A user cannot be friends with themselves.');
  }

  // Check if either direction of friendship already exists
  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId }
      ]
    }
  });

  if (existingFriendship) {
    throw new Error('Friendship already exists between these users.');
  }

  // Verify both users exist
  const [user, friend] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findUnique({ where: { id: friendId } })
  ]);

  if (!user || !friend) {
    throw new Error('One or both users not found.');
  }

  // Create friendship (bidirectional - we'll store it one way)
  await prisma.friendship.create({
    data: {
      userId: userId,
      friendId: friendId
    }
  });
}

/**
 * Remove a friendship relationship
 */
export async function unlinkUsers(userId: string, friendId: string): Promise<void> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId }
      ]
    }
  });

  if (!friendship) {
    throw new Error('Friendship does not exist between these users.');
  }

  await prisma.friendship.delete({
    where: { id: friendship.id }
  });
}

