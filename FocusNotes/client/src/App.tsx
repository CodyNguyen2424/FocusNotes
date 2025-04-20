import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { NoteListItem } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import Home from "@/pages/home";
import Editor from "@/pages/editor";
import NotFound from "@/pages/not-found";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [recentUploads, setRecentUploads] = useState<string[]>([]);
  const [_, navigate] = useLocation();

  // Fetch notes for sidebar
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/notes');
        if (!res.ok) throw new Error('Failed to fetch notes');
        const data = await res.json() as NoteListItem[];
        setNotes(data);
        
        // Extract recent uploads for sidebar
        const uploads = data
          .filter((note: NoteListItem) => note.originalVideo)
          .map((note: NoteListItem) => note.originalVideo as string)
          .slice(0, 3);
        
        setRecentUploads(uploads);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };
    
    fetchNotes();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateNewNote = () => {
    // Navigate to home to create a new note
    navigate("/");
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header toggleSidebar={toggleSidebar} />
          
          <div className="flex flex-1 overflow-hidden">
            <Sidebar 
              notes={notes} 
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onNewNote={handleCreateNewNote}
              recentUploads={recentUploads}
            />
            
            <main className="flex-1 overflow-y-auto bg-background dark:bg-gray-900">
              <Toaster />
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/editor/:id" component={Editor} />
                <Route component={NotFound} />
              </Switch>
            </main>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
