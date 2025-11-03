const prisma = require('../prisma/client');
const { calculatePopularityScore } = require('./userService');

async function getGraphData() {
  const users = await prisma.user.findMany({
    include: { friendshipsInitiated: true, friendshipsReceived: true },
  });

  const nodes = await Promise.all(
    users.map(async (user) => {
      const popularityScore = await calculatePopularityScore(user.id);
      return {
        id: user.id,
        username: user.username,
        age: user.age,
        hobbies: user.hobbies,
        popularityScore,
      };
    })
  );

  const edgesSet = new Set();
  const edges = [];

  users.forEach((user) => {
    user.friendshipsInitiated.forEach((friendship) => {
      const edgeKey = [friendship.userId, friendship.friendId].sort().join('-');
      if (!edgesSet.has(edgeKey)) {
        edgesSet.add(edgeKey);
        edges.push({ id: friendship.id, source: friendship.userId, target: friendship.friendId });
      }
    });
  });

  return { nodes, edges };
}

module.exports = { getGraphData };


