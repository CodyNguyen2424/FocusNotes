import { Plus, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useLocation } from "wouter";
import { NoteListItem } from "@/lib/types";
import { getFormatTimeAgo } from "@/lib/utils/note-utils";

interface SidebarProps {
  notes: NoteListItem[];
  isOpen: boolean;
  onClose?: () => void;
  onNewNote?: () => void;
  recentUploads?: string[];
}

export function Sidebar({ 
  notes, 
  isOpen,
  onClose,
  onNewNote,
  recentUploads = [] 
}: SidebarProps) {
  const [location, navigate] = useLocation();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      ></div>
      
      <aside className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-auto w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-screen h-full flex flex-col`}>
        <ScrollArea className="flex-1 pt-4">
          <div className="px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">My Notes</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:text-primary/80"
                onClick={onNewNote}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            
            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map(note => (
                  <Link 
                    key={note.id} 
                    href={`/editor/${note.id}`}
                  >
                    <a className={`block p-3 rounded-lg cursor-pointer transition-colors ${location === `/editor/${note.id}` ? 'bg-gray-100 dark:bg-gray-800' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 truncate">
                        {note.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Edited {getFormatTimeAgo(note.updatedAt)}
                      </div>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                No notes yet
              </div>
            )}
            
            {recentUploads.length > 0 && (
              <div className="mt-8">
                <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Recent Uploads
                </h3>
                
                {recentUploads.map((filename, i) => (
                  <div key={i} className="flex items-center mb-3 text-sm text-gray-700 dark:text-gray-300">
                    <FileVideo className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{filename}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate("/")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload New Video
          </Button>
        </div>
      </aside>
    </>
  );
}
