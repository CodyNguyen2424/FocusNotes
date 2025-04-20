import { NoteBlock, NoteContent } from "@shared/schema";
import { nanoid } from "nanoid";

export function createEmptyNote(): NoteContent {
  return {
    blocks: [
      {
        id: nanoid(),
        type: 'title',
        content: 'Untitled Notes',
      },
      {
        id: nanoid(),
        type: 'empty',
        content: '',
      },
    ],
  };
}

export function createEmptyBlock(type: NoteBlock['type'] = 'empty'): NoteBlock {
  return {
    id: nanoid(),
    type,
    content: '',
    ...(type === 'todo' ? { checked: false } : {}),
  };
}

export function convertBlockType(block: NoteBlock, newType: NoteBlock['type']): NoteBlock {
  // Create a new block with the same content but different type
  const convertedBlock: NoteBlock = {
    ...block,
    type: newType,
  };
  
  // Add specific properties based on type
  if (newType === 'todo' && !('checked' in convertedBlock)) {
    convertedBlock.checked = false;
  }
  
  return convertedBlock;
}

export function getFormatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return "just now";
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

export function formatReadableDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatReadableTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getBlockIcon(type: NoteBlock['type']): string {
  switch (type) {
    case 'title': return 'heading';
    case 'heading': return 'heading';
    case 'subheading': return 'heading';
    case 'paragraph': return 'align-left';
    case 'bullet-list': return 'list-ul';
    case 'numbered-list': return 'list-ol';
    case 'quote': return 'quote-left';
    case 'code': return 'code';
    case 'image': return 'image';
    case 'todo': return 'check-square';
    case 'callout': return 'info-circle';
    case 'divider': return 'minus';
    case 'empty': return 'paragraph';
    default: return 'paragraph';
  }
}
