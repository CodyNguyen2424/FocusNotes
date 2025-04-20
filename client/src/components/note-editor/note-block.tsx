import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { NoteBlock } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus } from "lucide-react";
import { BlockMenu } from "./block-menu";
import { cn } from "@/lib/utils";

interface NoteBlockProps {
  block: NoteBlock;
  onChange: (id: string, content: string) => void;
  onToggleCheck?: (id: string, checked: boolean) => void;
  onAddBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onChangeType: (id: string, type: NoteBlock['type']) => void;
  onFocus?: (id: string) => void;
  isSelected?: boolean;
}

export function NoteBlockComponent({
  block,
  onChange,
  onToggleCheck,
  onAddBlock,
  onDeleteBlock,
  onChangeType,
  onFocus,
  isSelected = false,
}: NoteBlockProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(block.content === '');
  const contentEditableRef = useRef<HTMLDivElement>(null);
  
  // Update the content editable div when the block content changes externally
  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.textContent !== block.content) {
      contentEditableRef.current.textContent = block.content;
    }
    setShowPlaceholder(block.content === '');
  }, [block.content]);

  const handleInput = () => {
    if (contentEditableRef.current) {
      const content = contentEditableRef.current.textContent || '';
      onChange(block.id, content);
      setShowPlaceholder(content === '');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Handle Enter key to create a new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onAddBlock(block.id);
    }
    
    // Handle Backspace when block is empty to delete it
    if (e.key === 'Backspace' && contentEditableRef.current?.textContent === '') {
      e.preventDefault();
      onDeleteBlock(block.id);
    }
    
    // Handle Tab to change indentation or navigation (not implemented yet)
    if (e.key === 'Tab') {
      e.preventDefault();
      // Future: implement indentation
    }
  };

  // Render different block types
  const renderBlockContent = () => {
    switch (block.type) {
      case 'title':
        return (
          <h1 
            ref={contentEditableRef}
            className="text-3xl font-bold text-gray-900 dark:text-gray-50 outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus?.(block.id)}
            data-placeholder="Untitled"
          />
        );
      
      case 'heading':
        return (
          <h2 
            ref={contentEditableRef}
            className="text-xl font-semibold text-gray-800 dark:text-gray-100 outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus?.(block.id)}
            data-placeholder="Heading"
          />
        );
      
      case 'subheading':
        return (
          <h3 
            ref={contentEditableRef}
            className="text-lg font-medium text-gray-800 dark:text-gray-100 outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus?.(block.id)}
            data-placeholder="Subheading"
          />
        );
      
      case 'paragraph':
        return (
          <p 
            ref={contentEditableRef}
            className="text-gray-700 dark:text-gray-300 outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus?.(block.id)}
            data-placeholder="Type '/' for commands"
          />
        );
      
      case 'bullet-list':
        return (
          <div className="flex">
            <div className="text-gray-700 dark:text-gray-300 mr-2">•</div>
            <div 
              ref={contentEditableRef}
              className="text-gray-700 dark:text-gray-300 outline-none flex-1"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => onFocus?.(block.id)}
              data-placeholder="List item"
            />
          </div>
        );
      
      case 'numbered-list':
        return (
          <div className="flex">
            <div className="text-gray-700 dark:text-gray-300 mr-2 min-w-[20px]">1.</div>
            <div 
              ref={contentEditableRef}
              className="text-gray-700 dark:text-gray-300 outline-none flex-1"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => onFocus?.(block.id)}
              data-placeholder="List item"
            />
          </div>
        );
      
      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">
            <div 
              ref={contentEditableRef}
              className="text-gray-700 dark:text-gray-300 outline-none"
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => onFocus?.(block.id)}
              data-placeholder="Quote"
            />
          </blockquote>
        );
      
      case 'code':
        return (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 font-mono text-sm overflow-x-auto">
            <pre>
              <div 
                ref={contentEditableRef}
                className="text-gray-800 dark:text-gray-200 outline-none"
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => onFocus?.(block.id)}
                data-placeholder="Code"
              />
            </pre>
          </div>
        );
      
      case 'todo':
        return (
          <div className="flex items-start">
            <Checkbox 
              className="mt-1 mr-2"
              checked={block.checked}
              onCheckedChange={(checked) => onToggleCheck?.(block.id, checked as boolean)}
            />
            <div 
              ref={contentEditableRef}
              className={cn(
                "outline-none flex-1",
                block.checked 
                  ? "text-gray-500 dark:text-gray-400 line-through" 
                  : "text-gray-700 dark:text-gray-300"
              )}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => onFocus?.(block.id)}
              data-placeholder="To-do"
            />
          </div>
        );
      
      case 'callout':
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-md">
            <div className="flex items-start">
              <span className="text-blue-500 mr-2">💡</span>
              <div 
                ref={contentEditableRef}
                className="text-gray-700 dark:text-gray-300 outline-none flex-1"
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => onFocus?.(block.id)}
                data-placeholder="Callout"
              />
            </div>
          </div>
        );
      
      case 'divider':
        return <hr className="my-4 border-gray-200 dark:border-gray-700" />;
      
      case 'empty':
      default:
        return (
          <div 
            ref={contentEditableRef}
            className="outline-none min-h-[1.5em] text-gray-700 dark:text-gray-300"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus?.(block.id)}
            data-placeholder="Type '/' for commands"
          />
        );
    }
  };

  return (
    <div 
      className={cn(
        "notion-block group relative mb-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 rounded-md transition-colors",
        isSelected ? "bg-gray-50 dark:bg-gray-800/50" : "",
        block.type === 'divider' ? "py-4" : ""
      )}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
      data-block-id={block.id}
    >
      {/* Block handle and menu */}
      <div className={cn(
        "absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 flex items-center space-x-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity",
        showMenu ? "opacity-100" : ""
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 cursor-grab"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </Button>
        
        <BlockMenu 
          onSelectType={onChangeType} 
          blockId={block.id} 
          currentType={block.type}
          onDelete={() => onDeleteBlock(block.id)}
        />
      </div>
      
      {/* Add button that appears on hover at the bottom of the block */}
      <div className="absolute left-0 bottom-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity -mb-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm"
          onClick={() => onAddBlock(block.id)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      {/* Block content */}
      <div className="px-2 py-1">
        {renderBlockContent()}
      </div>
    </div>
  );
}
