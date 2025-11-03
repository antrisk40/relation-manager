import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';
import { User, GraphNode, GraphEdge } from '../types/user';
import { userApi, graphApi } from '../services/api';
import toast from 'react-hot-toast';

interface StoreState {
  // Graph state
  nodes: Node[];
  edges: Edge[];
  
  // User management
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  
  // Hobbies
  allHobbies: string[];
  
  // History for undo/redo
  history: Array<{ nodes: Node[]; edges: Edge[] }>;
  historyIndex: number;
  
  // Persisted node positions by id
  nodePositions: Record<string, { x: number; y: number }>;
  
  // Hobby filter
  filterHobby: string;
  
  // Actions
  fetchGraphData: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  createUser: (data: { username: string; age: number; hobbies: string[] }) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  linkUsers: (userId: string, friendId: string) => Promise<void>;
  unlinkUsers: (userId: string, friendId: string) => Promise<void>;
  addHobbyToUser: (userId: string, hobby: string) => Promise<void>;
  
  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDrag: () => void;
  
  // Selection
  setSelectedUser: (user: User | null) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // Filtering
  setFilterHobby: (hobby: string) => void;
}

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
type GetState<T> = () => T;

export const useStore = create<StoreState>((set: SetState<StoreState>, get: GetState<StoreState>) => {
  const loadSavedPositions = (): Record<string, { x: number; y: number }> => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('nodePositions') : null;
      return raw ? JSON.parse(raw) : {};
    } catch (_) {
      return {};
    }
  };

  const savePositions = (positions: Record<string, { x: number; y: number }>) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('nodePositions', JSON.stringify(positions));
      }
    } catch (_) {
      // ignore storage errors
    }
  };
  const applyHobbyFilter = (nodes: Node[], edges: Edge[]) => {
    const term = get().filterHobby.trim().toLowerCase();
    if (!term) {
      // clear hidden
      nodes.forEach(n => (n.hidden = false));
      edges.forEach(e => (e.hidden = false));
      return;
    }
    const visibleNodeIds = new Set<string>();
    nodes.forEach(n => {
      const hobbies: string[] = (n.data as any).hobbies || [];
      const matches = hobbies.some(h => h.toLowerCase().includes(term));
      n.hidden = !matches;
      if (!n.hidden) visibleNodeIds.add(n.id);
    });
    edges.forEach(e => {
      e.hidden = !(visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target));
    });
  };

  const updateGraphFromData = (nodes: GraphNode[], edges: GraphEdge[]) => {
    const saved = get().nodePositions;
    // Pre-compute friend counts from edges
    const friendCountByUserId = new Map<string, number>();
    edges.forEach((e: GraphEdge) => {
      friendCountByUserId.set(e.source, (friendCountByUserId.get(e.source) || 0) + 1);
      friendCountByUserId.set(e.target, (friendCountByUserId.get(e.target) || 0) + 1);
    });

    const flowNodes: Node[] = nodes.map((node: GraphNode, idx: number) => ({
      id: node.id,
      type: node.popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode',
      position: saved[node.id]
        || get().nodes.find(n => n.id === node.id)?.position
        || { x: (idx % 6) * 180 + 40, y: Math.floor(idx / 6) * 140 + 40 },
      data: {
        label: node.username,
        age: node.age,
        hobbies: node.hobbies,
        popularityScore: node.popularityScore,
        id: node.id,
        friendCount: friendCountByUserId.get(node.id) || 0,
      },
    }));

    const flowEdges: Edge[] = edges.map((edge: GraphEdge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: true,
    }));

    applyHobbyFilter(flowNodes, flowEdges);
    set({ nodes: flowNodes, edges: flowEdges });
  };

  return {
    nodes: [],
    edges: [],
    users: [],
    selectedUser: null,
    isLoading: false,
    allHobbies: [],
    history: [],
    historyIndex: -1,
    nodePositions: loadSavedPositions(),
    filterHobby: '',

    fetchGraphData: async (): Promise<void> => {
      set({ isLoading: true });
      try {
        const data = await graphApi.getGraphData();
        updateGraphFromData(data.nodes, data.edges);
        
        // Extract all unique hobbies
        const hobbies = new Set<string>();
        data.nodes.forEach(node => {
          node.hobbies.forEach(hobby => hobbies.add(hobby));
        });
        set({ allHobbies: Array.from(hobbies).sort() });
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to fetch graph data');
      } finally {
        set({ isLoading: false });
      }
    },

    fetchUsers: async (): Promise<void> => {
      set({ isLoading: true });
      try {
        const users = await userApi.getAll();
        set({ users });
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to fetch users');
      } finally {
        set({ isLoading: false });
      }
    },

    createUser: async (data: { username: string; age: number; hobbies: string[] }): Promise<void> => {
      try {
        const created = await userApi.create(data);
        toast.success('User created successfully');
        set({ users: [created, ...get().users] });
        const existing = get().nodePositions[created.id];
        const position = existing || { x: 60 + Math.random() * 200, y: 60 + Math.random() * 160 };
        const newNode = {
          id: created.id,
          type: created.popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode',
          position,
          data: {
            label: created.username,
            age: created.age,
            hobbies: created.hobbies,
            popularityScore: created.popularityScore,
            id: created.id,
            friendCount: 0,
          },
        } as any;
        const nextPositions = { ...get().nodePositions, [created.id]: position };
        savePositions(nextPositions);
        set({
          nodes: [
            ...get().nodes,
            newNode,
          ],
          nodePositions: nextPositions,
        });
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to create user');
        throw error;
      }
    },

    updateUser: async (id: string, data: Partial<User>): Promise<void> => {
      try {
        const updated = await userApi.update(id, data);
        toast.success('User updated successfully');
        set({ users: get().users.map(u => u.id === updated.id ? updated : u) });
        set({
          nodes: get().nodes.map(n => {
            if (n.id !== updated.id) return n;
            return {
              ...n,
              type: updated.popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode',
              data: {
                ...n.data,
                label: updated.username,
                age: updated.age,
                hobbies: updated.hobbies,
                popularityScore: updated.popularityScore,
              },
            } as any;
          })
        });
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to update user');
        throw error;
      }
    },

    deleteUser: async (id: string): Promise<void> => {
      try {
        await userApi.delete(id);
        toast.success('User deleted successfully');
        set({ users: get().users.filter(u => u.id !== id) });
        set({
          nodes: get().nodes.filter(n => n.id !== id),
          edges: get().edges.filter(e => e.source !== id && e.target !== id),
        });
      } catch (error: any) {
        const message = error.response?.data?.error || 'Failed to delete user';
        toast.error(message);
        throw error;
      }
    },

    linkUsers: async (userId: string, friendId: string): Promise<void> => {
      try {
        await userApi.link(userId, friendId);
        toast.success('Users linked successfully');
        // Update edges locally to avoid full refresh
        const exists = get().edges.some((e: Edge) =>
          (e.source === userId && e.target === friendId) || (e.source === friendId && e.target === userId)
        );
        if (!exists) {
          set({
            edges: [
              ...get().edges,
              { id: `${userId}-${friendId}`, source: userId, target: friendId, type: 'smoothstep', animated: true } as Edge,
            ],
          });
          // bump friend counts
          set({
            nodes: get().nodes.map((n: Node) =>
              n.id === userId || n.id === friendId
                ? { ...n, data: { ...n.data, friendCount: (n.data as any).friendCount + 1 } }
                : n
            ),
          });
        }
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to link users');
        throw error;
      }
    },

    unlinkUsers: async (userId: string, friendId: string): Promise<void> => {
      try {
        await userApi.unlink(userId, friendId);
        toast.success('Users unlinked successfully');
        // Remove edge locally to avoid full refresh
        set({
          edges: get().edges.filter((e: Edge) => !(
            (e.source === userId && e.target === friendId) || (e.source === friendId && e.target === userId)
          )),
        });
        // reduce friend counts, floor at 0
        set({
          nodes: get().nodes.map((n: Node) =>
            n.id === userId || n.id === friendId
              ? { ...n, data: { ...n.data, friendCount: Math.max(0, (n.data as any).friendCount - 1) } }
              : n
          ),
        });
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to unlink users');
        throw error;
      }
    },

    addHobbyToUser: async (userId: string, hobby: string): Promise<void> => {
      const user = get().users.find(u => u.id === userId);
      if (!user) return;

      if (user.hobbies.includes(hobby)) {
        toast.error('User already has this hobby');
        return;
      }

      try {
        await userApi.update(userId, {
          hobbies: [...user.hobbies, hobby],
        });
        toast.success('Hobby added successfully');
        await get().fetchGraphData();
        await get().fetchUsers();
      } catch (error: any) {
        toast.error(error.response?.data?.error || 'Failed to add hobby');
      }
    },

    onNodesChange: (changes: NodeChange[]): void => {
      const updated = applyNodeChanges(changes, get().nodes);
      // persist positions for moved nodes
      const positions = { ...get().nodePositions };
      updated.forEach((n: Node) => {
        if (n.position) {
          positions[n.id] = { x: n.position.x, y: n.position.y };
        }
      });
      savePositions(positions);
      set({ nodes: updated, nodePositions: positions });
    },

    onEdgesChange: (changes: EdgeChange[]): void => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    onConnect: (connection: Connection): void => {
      if (connection.source && connection.target) {
        get().linkUsers(connection.source, connection.target);
      }
      set({
        edges: addEdge(connection, get().edges),
      });
    },

    onNodeDrag: () => {
      get().saveToHistory();
    },

    setSelectedUser: (user: User | null): void => {
      set({ selectedUser: user });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const previous = history[historyIndex - 1];
        set({
          nodes: previous.nodes,
          edges: previous.edges,
          historyIndex: historyIndex - 1,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const next = history[historyIndex + 1];
        set({
          nodes: next.nodes,
          edges: next.edges,
          historyIndex: historyIndex + 1,
        });
      }
    },

    saveToHistory: () => {
      const { nodes, edges, history, historyIndex } = get();
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ nodes: [...nodes], edges: [...edges] });
      
      // Limit history to 50 entries
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      
      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },

    setFilterHobby: (hobby: string) => {
      set({ filterHobby: hobby });
      // apply to current graph
      const currentNodes = [...get().nodes];
      const currentEdges = [...get().edges];
      applyHobbyFilter(currentNodes, currentEdges);
      set({ nodes: currentNodes, edges: currentEdges });
    },
  };
});

