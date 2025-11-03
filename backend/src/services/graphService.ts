import prisma from '../prisma/client';
import { GraphData } from '../types/user';
import { calculatePopularityScore } from './userService';

/**
 * Get graph data with nodes and edges
 */
export async function getGraphData(): Promise<GraphData> {
  const users = await prisma.user.findMany({
    include: {
      friendshipsInitiated: true,
      friendshipsReceived: true
    }
  });

  const nodes = await Promise.all(
    users.map(async (user) => {
      const popularityScore = await calculatePopularityScore(user.id);
      return {
        id: user.id,
        username: user.username,
        age: user.age,
        hobbies: user.hobbies,
        popularityScore
      };
    })
  );

  // Get all unique friendships (avoid duplicates)
  const edgesSet = new Set<string>();
  const edges: Array<{ id: string; source: string; target: string }> = [];

  users.forEach(user => {
    user.friendshipsInitiated.forEach(friendship => {
      const edgeKey = [friendship.userId, friendship.friendId].sort().join('-');
      if (!edgesSet.has(edgeKey)) {
        edgesSet.add(edgeKey);
        edges.push({
          id: friendship.id,
          source: friendship.userId,
          target: friendship.friendId
        });
      }
    });
  });

  return { nodes, edges };
}

