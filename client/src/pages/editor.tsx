import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { NoteEditor } from "@/components/note-editor/note-editor";
import { LoaderIcon } from "lucide-react";
import { Note } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

export default function Editor() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch note data
  const { data: note, isLoading, isError, error } = useQuery<Note>({
    queryKey: [`/api/notes/${id}`],
    enabled: !!id,
  });
  
  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async (updatedNote: Partial<Note>) => {
      const res = await apiRequest('PATCH', `/api/notes/${id}`, updatedNote);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([`/api/notes/${id}`], data);
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save',
        description: `Error: ${error.message}`,
        variant: 'destructive',
      });
    }
  });
  
  const handleSaveNote = async (updatedNote: Partial<Note>) => {
    return updateNoteMutation.mutateAsync(updatedNote);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoaderIcon className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-700 dark:text-gray-300">Loading note...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="container mx-auto p-4 max-w-md text-center mt-20">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Note</h2>
          <p className="text-red-600 dark:text-red-400 mb-4">{error?.message || "Failed to load the note"}</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (!note) {
    return (
      <div className="container mx-auto p-4 max-w-md text-center mt-20">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Note Not Found</h2>
          <p className="text-yellow-600 dark:text-yellow-400 mb-4">The note you're looking for doesn't exist or has been deleted.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <NoteEditor 
        note={note} 
        onSave={handleSaveNote}
        autoSave={true}
      />
    </div>
  );
}
