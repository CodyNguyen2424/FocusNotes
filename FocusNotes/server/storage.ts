import { notes, type Note, type InsertNote, type NoteBlock, type NoteContent, type User, type InsertUser, users } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getNotes(userId?: number): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private notesData: Map<number, Note>;
  private userCurrentId: number;
  private noteCurrentId: number;

  constructor() {
    this.users = new Map();
    this.notesData = new Map();
    this.userCurrentId = 1;
    this.noteCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Note methods
  async getNotes(userId?: number): Promise<Note[]> {
    const notes = Array.from(this.notesData.values());
    if (userId) {
      return notes.filter(note => note.userId === userId);
    }
    return notes;
  }

  async getNote(id: number): Promise<Note | undefined> {
    return this.notesData.get(id);
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const now = new Date();
    const note: Note = {
      ...insertNote,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.notesData.set(id, note);
    return note;
  }

  async updateNote(id: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notesData.get(id);
    if (!existingNote) {
      return undefined;
    }

    const updatedNote: Note = {
      ...existingNote,
      ...noteUpdate,
      updatedAt: new Date(),
    };
    
    this.notesData.set(id, updatedNote);
    return updatedNote;
  }

  async deleteNote(id: number): Promise<boolean> {
    if (!this.notesData.has(id)) {
      return false;
    }
    return this.notesData.delete(id);
  }
}

export const storage = new MemStorage();
