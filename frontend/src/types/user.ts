export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: string;
  popularityScore: number;
}

export interface CreateUserDto {
  username: string;
  age: number;
  hobbies: string[];
}

export interface UpdateUserDto {
  username?: string;
  age?: number;
  hobbies?: string[];
}

export interface GraphNode {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  popularityScore: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

