import { users, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat history and PII storage operations
  storePII(userId: number, sessionId: string, piiData: any): Promise<void>;
  getPII(userId: number, sessionId: string): Promise<any | undefined>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

// In-memory implementation of storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private piiStorage: Map<string, any>;
  currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.piiStorage = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Add demo user for testing
    this.createUser({
      username: "demo",
      password: "$2b$10$fNgm7mTr.NeL3jH/7OZu8ekDr63Y.G0RLGVYb7stHXs8bSFjHZwrO", // password is "password"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Store PII data in memory (in production, this would be encrypted and stored securely)
  async storePII(userId: number, sessionId: string, piiData: any): Promise<void> {
    const key = `${userId}:${sessionId}`;
    this.piiStorage.set(key, piiData);
  }
  
  // Retrieve PII data
  async getPII(userId: number, sessionId: string): Promise<any | undefined> {
    const key = `${userId}:${sessionId}`;
    return this.piiStorage.get(key);
  }
}

export const storage = new MemStorage();
