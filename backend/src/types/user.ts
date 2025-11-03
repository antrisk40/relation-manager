export interface User {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: Date;
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

export interface GraphData {
  nodes: Array<{
    id: string;
    username: string;
    age: number;
    hobbies: string[];
    popularityScore: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
  }>;
}


