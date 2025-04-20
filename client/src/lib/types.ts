import { NoteBlock, NoteContent } from "@shared/schema";

export interface Note {
  id: number;
  title: string;
  content: NoteContent;
  createdAt: string;
  updatedAt: string;
  originalVideo?: string;
  userId?: number;
}

export interface NoteListItem {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  originalVideo?: string;
}

export interface VideoUploadProgress {
  status: 'idle' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  message?: string;
  currentStep?: 'upload' | 'transcription' | 'summarization' | 'formatting';
}

export interface ExportOptions {
  format: 'markdown' | 'pdf';
  includeTitle: boolean;
  includeMetadata: boolean;
}

export interface BlockOperation {
  type: 'add' | 'delete' | 'update' | 'move';
  blockId?: string;
  data?: any;
  position?: number;
}

export interface User {
  id: number;
  username: string;
}

export type BlockType = NoteBlock['type'];

export interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  action: () => void;
  dividerAfter?: boolean;
}
