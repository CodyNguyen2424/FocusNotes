import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { NoteBlock, NoteContent } from "@shared/schema";
import { NoteBlockComponent } from "./note-block";
import { FormattingToolbar, getDefaultFormattingActions } from "./formatting-toolbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { nanoid } from "nanoid";
import { createEmptyBlock, convertBlockType, formatReadableDate } from "@/lib/utils/note-utils";
import { Save, Download, Share, ChevronDown } from "lucide-react";
import { exportMarkdown, exportPDF } from "@/lib/utils/export-utils";
import { Note, ExportOptions } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

interface NoteEditorProps {
  note: Note;
  onSave: (note: Partial<Note>) => void;
  autoSave?: boolean;
}

export function NoteEditor({ note, onSave, autoSave = true }: NoteEditorProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(note.title);
  const [blocks, setBlocks] = useState<NoteBlock[]>(note.content.blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date(note.updatedAt));

  // Auto-save effect
  useEffect(() => {
    if (!autoSave) return;
    
    const saveTimer = setTimeout(() => {
      handleSave();
    }, 3000);
    
    return () => clearTimeout(saveTimer);
  }, [blocks, title, autoSave]);

  // Update blocks when note changes externally
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBlocks(note.content.blocks);
      setLastSavedAt(new Date(note.updatedAt));
    }
  }, [note]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleBlockContentChange = useCallback((id: string, content: string) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? { ...block, content } : block
      )
    );
  }, []);

  const handleToggleCheck = useCallback((id: string, checked: boolean) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? { ...block, checked } : block
      )
    );
  }, []);

  const handleAddBlock = useCallback((id: string) => {
    setBlocks(prevBlocks => {
      const index = prevBlocks.findIndex(block => block.id === id);
      if (index === -1) return prevBlocks;
      
      const newBlock = createEmptyBlock();
      const updatedBlocks = [...prevBlocks];
      updatedBlocks.splice(index + 1, 0, newBlock);
      
      // Set focus to new block in the next tick
      setTimeout(() => {
        setSelectedBlockId(newBlock.id);
        const newBlockEl = document.querySelector(`[data-block-id="${newBlock.id}"] [contenteditable]`);
        if (newBlockEl) {
          (newBlockEl as HTMLElement).focus();
        }
      }, 0);
      
      return updatedBlocks;
    });
  }, []);

  const handleDeleteBlock = useCallback((id: string) => {
    setBlocks(prevBlocks => {
      // Don't allow deleting the last block
      if (prevBlocks.length <= 1) {
        return [createEmptyBlock()];
      }
      
      const index = prevBlocks.findIndex(block => block.id === id);
      if (index === -1) return prevBlocks;
      
      const updatedBlocks = prevBlocks.filter(block => block.id !== id);
      
      // Set focus to previous block or next block if available
      setTimeout(() => {
        const newFocusIndex = Math.max(0, index - 1);
        const newFocusId = updatedBlocks[newFocusIndex]?.id;
        if (newFocusId) {
          setSelectedBlockId(newFocusId);
          const el = document.querySelector(`[data-block-id="${newFocusId}"] [contenteditable]`);
          if (el) {
            (el as HTMLElement).focus();
          }
        }
      }, 0);
      
      return updatedBlocks;
    });
  }, []);

  const handleChangeBlockType = useCallback((id: string, type: NoteBlock['type']) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? convertBlockType(block, type) : block
      )
    );
  }, []);

  const handleBlockFocus = useCallback((id: string) => {
    setSelectedBlockId(id);
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const updatedNote = {
        title,
        content: {
          ...note.content,
          blocks
        }
      };
      
      await onSave(updatedNote);
      setLastSavedAt(new Date());
      
      toast({
        description: "Note saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving note",
        description: "Your changes couldn't be saved. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = (format: 'markdown' | 'pdf') => {
    try {
      const options: ExportOptions = {
        format,
        includeTitle: true,
        includeMetadata: true
      };
      
      if (format === 'markdown') {
        exportMarkdown(note, options);
      } else {
        exportPDF(note, options);
      }
      
      toast({
        description: `Note exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: `Could not export as ${format.toUpperCase()}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
      {/* Editor Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Input 
            type="text" 
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Notes"
            className="text-xl font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
          />
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Download className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport('markdown')}>
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Formatting Toolbar */}
      <FormattingToolbar actions={getDefaultFormattingActions()} />
      
      {/* Notes Content Area */}
      <CardContent className="p-6 notes-container overflow-y-auto min-h-[60vh]">
        {blocks.map(block => (
          <NoteBlockComponent
            key={block.id}
            block={block}
            onChange={handleBlockContentChange}
            onToggleCheck={handleToggleCheck}
            onAddBlock={handleAddBlock}
            onDeleteBlock={handleDeleteBlock}
            onChangeType={handleChangeBlockType}
            onFocus={handleBlockFocus}
            isSelected={selectedBlockId === block.id}
          />
        ))}
      </CardContent>
      
      {/* Notes Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {lastSavedAt ? `Last updated: ${formatReadableDate(lastSavedAt.toISOString())} at ${lastSavedAt.toLocaleTimeString()}` : 'Not saved yet'}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="link"
              size="sm"
              className="text-primary hover:text-primary/80"
              onClick={() => handleExport('markdown')}
            >
              Export as Markdown
            </Button>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <Button 
              variant="link"
              size="sm"
              className="text-primary hover:text-primary/80"
              onClick={() => handleExport('pdf')}
            >
              Export as PDF
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
