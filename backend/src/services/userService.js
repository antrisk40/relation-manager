const prisma = require('../prisma/client');

async function calculatePopularityScore(userId) {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userId: userId }, { friendId: userId }] },
    include: {
      user: {
        include: {
          friendshipsInitiated: { include: { friend: true } },
          friendshipsReceived: { include: { user: true } },
        },
      },
      friend: {
        include: {
          friendshipsInitiated: { include: { friend: true } },
          friendshipsReceived: { include: { user: true } },
        },
      },
    },
  });

  const friendIds = new Set();
  friendships.forEach((f) => {
    if (f.userId === userId) {
      friendIds.add(f.friendId);
    } else {
      friendIds.add(f.userId);
    }
  });

  const uniqueFriendsCount = friendIds.size;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hobbies: true },
  });
  if (!user) return 0;

  let totalSharedHobbies = 0;
  const friendUsers = await prisma.user.findMany({
    where: { id: { in: Array.from(friendIds) } },
    select: { hobbies: true },
  });

  friendUsers.forEach((friend) => {
    const sharedHobbies = friend.hobbies.filter((hobby) => user.hobbies.includes(hobby));
    totalSharedHobbies += sharedHobbies.length;
  });

  return uniqueFriendsCount + totalSharedHobbies * 0.5;
}

async function getAllUsers() {
  const users = await prisma.user.findMany({
    include: { friendshipsInitiated: true, friendshipsReceived: true },
    orderBy: { createdAt: 'desc' },
  });

  const usersWithScores = await Promise.all(
    users.map(async (user) => {
      const friendIds = new Set();
      user.friendshipsInitiated.forEach((f) => friendIds.add(f.friendId));
      user.friendshipsReceived.forEach((f) => friendIds.add(f.userId));
      const popularityScore = await calculatePopularityScore(user.id);
      return {
        id: user.id,
        username: user.username,
        age: user.age,
        hobbies: user.hobbies,
        friends: Array.from(friendIds),
        createdAt: user.createdAt,
        popularityScore,
      };
    })
  );

  return usersWithScores;
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { friendshipsInitiated: true, friendshipsReceived: true },
  });
  if (!user) return null;

  const friendIds = new Set();
  user.friendshipsInitiated.forEach((f) => friendIds.add(f.friendId));
  user.friendshipsReceived.forEach((f) => friendIds.add(f.userId));
  const popularityScore = await calculatePopularityScore(user.id);
  return {
    id: user.id,
    username: user.username,
    age: user.age,
    hobbies: user.hobbies,
    friends: Array.from(friendIds),
    createdAt: user.createdAt,
    popularityScore,
  };
}

async function createUser(data) {
  const user = await prisma.user.create({
    data: { username: data.username, age: data.age, hobbies: data.hobbies },
  });
  return {
    id: user.id,
    username: user.username,
    age: user.age,
    hobbies: user.hobbies,
    friends: [],
    createdAt: user.createdAt,
    popularityScore: 0,
  };
}

async function updateUser(id, data) {
  const user = await prisma.user.update({
    where: { id },
    data: { username: data.username, age: data.age, hobbies: data.hobbies },
    include: { friendshipsInitiated: true, friendshipsReceived: true },
  });
  const friendIds = new Set();
  user.friendshipsInitiated.forEach((f) => friendIds.add(f.friendId));
  user.friendshipsReceived.forEach((f) => friendIds.add(f.userId));
  const popularityScore = await calculatePopularityScore(user.id);
  return {
    id: user.id,
    username: user.username,
    age: user.age,
    hobbies: user.hobbies,
    friends: Array.from(friendIds),
    createdAt: user.createdAt,
    popularityScore,
  };
}

async function deleteUser(id) {
  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ userId: id }, { friendId: id }] },
  });
  if (friendships.length > 0) {
    throw new Error('Cannot delete user with existing friendships. Please unlink all relationships first.');
  }
  await prisma.user.delete({ where: { id } });
}

async function linkUsers(userId, friendId) {
  if (userId === friendId) {
    throw new Error('A user cannot be friends with themselves.');
  }
  const existingFriendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });
  if (existingFriendship) {
    throw new Error('Friendship already exists between these users.');
  }
  const [user, friend] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findUnique({ where: { id: friendId } }),
  ]);
  if (!user || !friend) {
    throw new Error('One or both users not found.');
  }
  await prisma.friendship.create({
    data: { userId: userId, friendId: friendId },
  });
}

async function unlinkUsers(userId, friendId) {
  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId: userId, friendId: friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  });
  if (!friendship) {
    throw new Error('Friendship does not exist between these users.');
  }
  await prisma.friendship.delete({ where: { id: friendship.id } });
}

module.exports = {
  calculatePopularityScore,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  linkUsers,
  unlinkUsers,
};


