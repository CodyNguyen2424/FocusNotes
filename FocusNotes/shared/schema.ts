import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").default("Untitled"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  content: jsonb("content").notNull(),
  originalVideo: text("original_video"),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true, 
  updatedAt: true
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type NoteBlock = {
  id: string;
  type: 'title' | 'heading' | 'subheading' | 'paragraph' | 'bullet-list' | 'numbered-list' | 'quote' | 'code' | 'image' | 'todo' | 'callout' | 'divider' | 'empty';
  content: string;
  checked?: boolean;
  metadata?: Record<string, any>;
};

export type NoteContent = {
  blocks: NoteBlock[];
  videoMetadata?: {
    duration: number;
    fileName: string;
    fileSize: number;
    dateProcessed: string;
  };
};

export const blockSchema = z.object({
  id: z.string(),
  type: z.enum(['title', 'heading', 'subheading', 'paragraph', 'bullet-list', 'numbered-list', 'quote', 'code', 'image', 'todo', 'callout', 'divider', 'empty']),
  content: z.string(),
  checked: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

export const noteContentSchema = z.object({
  blocks: z.array(blockSchema),
  videoMetadata: z.object({
    duration: z.number(),
    fileName: z.string(),
    fileSize: z.number(),
    dateProcessed: z.string(),
  }).optional()
});

export type TranscriptionResult = {
  text: string;
  duration: number;
};
