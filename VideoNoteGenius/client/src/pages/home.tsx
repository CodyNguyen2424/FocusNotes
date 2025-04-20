import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "@/components/ui/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VideoUploadProgress } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckIcon, 
  ClockIcon,
  Loader2Icon, 
  XIcon 
} from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<VideoUploadProgress>({
    status: 'idle',
    progress: 0,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      // Simulate progress updates since fetch doesn't have progress events
      setUploadProgress({
        status: 'uploading',
        progress: 10,
        message: 'Uploading video...',
        currentStep: 'upload'
      });
      
      // Actual upload
      console.log('Uploading file:', file.name, file.type, file.size);
      
      // Send the file directly instead of using apiRequest to avoid any transformation
      const res = await fetch('/api/process-video', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to process video');
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: 'Success!',
        description: 'Your video has been processed into notes.',
      });
      // Navigate to the editor with the new note
      navigate(`/editor/${data.id}`);
    },
    onError: (error: any) => {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: `Error: ${error?.message || 'Unknown error occurred'}`,
      });
      toast({
        title: 'Processing Failed',
        description: `Error: ${error?.message || 'Unknown error occurred'}`,
        variant: 'destructive',
      });
    }
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadProgress({
      status: 'idle',
      progress: 0,
    });
  };

  const handleProcessVideo = async () => {
    if (!selectedFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a video file to process.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      uploadMutation.mutate(selectedFile);

      // Simulate the processing steps for UI
      // In real app, these would come from backend status updates
      const steps = [
        { step: 'upload', progress: 30, message: 'Uploading video...' },
        { step: 'transcription', progress: 40, message: 'Transcribing audio...' },
        { step: 'transcription', progress: 60, message: 'Converting speech to text...' },
        { step: 'summarization', progress: 75, message: 'Summarizing key points...' },
        { step: 'formatting', progress: 90, message: 'Formatting notes in Notion style...' }
      ];
      
      // Simulate processing progress
      for (const step of steps) {
        if (uploadMutation.isPending) {
          await new Promise(resolve => setTimeout(resolve, 1500));
          setUploadProgress({
            status: 'processing',
            progress: step.progress,
            message: step.message,
            currentStep: step.step as any
          });
        }
      }
    } catch (error: any) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: `Error: ${error?.message || 'Unknown error occurred'}`,
      });
    }
  };

  const isProcessing = uploadProgress.status === 'uploading' || uploadProgress.status === 'processing';

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      {/* Upload Section */}
      <section className="mb-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Generate Notion-Style Notes</h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Upload a lecture video to automatically generate organized, editable notes. We'll transcribe the audio and structure the content for you.
            </p>
            
            <FileUploader onFileSelect={handleFileSelect} />
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Max file size: 200MB
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleProcessVideo}
                  disabled={!selectedFile || isProcessing || uploadMutation.isPending}
                  className="bg-primary dark:bg-gray-700 hover:bg-primary/90 dark:hover:bg-gray-600"
                >
                  {uploadMutation.isPending && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Notes
                </Button>
                
                <Button 
                  variant="outline"
                  disabled={isProcessing || uploadMutation.isPending}
                >
                  Import from URL
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
      
      {/* Processing Section */}
      {isProcessing && (
        <section className="mb-8">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Processing Your Video
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {uploadProgress.message || 'Processing...'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {uploadProgress.progress}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress.progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-6 text-sm text-gray-600 dark:text-gray-300">
                  <p>This might take a few minutes depending on the video length. We're:</p>
                  <ul className="mt-2 space-y-2">
                    <li className="flex items-center">
                      {uploadProgress.progress >= 30 ? (
                        <CheckIcon className="text-green-500 mr-2 h-4 w-4" />
                      ) : (
                        <ClockIcon className="text-gray-400 mr-2 h-4 w-4" />
                      )}
                      <span>Analyzing the audio track</span>
                    </li>
                    <li className="flex items-center">
                      {uploadProgress.currentStep === 'transcription' ? (
                        <Loader2Icon className="animate-spin text-primary mr-2 h-4 w-4" />
                      ) : uploadProgress.progress >= 60 ? (
                        <CheckIcon className="text-green-500 mr-2 h-4 w-4" />
                      ) : (
                        <ClockIcon className="text-gray-400 mr-2 h-4 w-4" />
                      )}
                      <span>Converting speech to text</span>
                    </li>
                    <li className="flex items-center">
                      {uploadProgress.currentStep === 'summarization' ? (
                        <Loader2Icon className="animate-spin text-primary mr-2 h-4 w-4" />
                      ) : uploadProgress.progress >= 75 ? (
                        <CheckIcon className="text-green-500 mr-2 h-4 w-4" />
                      ) : (
                        <ClockIcon className="text-gray-400 mr-2 h-4 w-4" />
                      )}
                      <span>Summarizing key points</span>
                    </li>
                    <li className="flex items-center">
                      {uploadProgress.currentStep === 'formatting' ? (
                        <Loader2Icon className="animate-spin text-primary mr-2 h-4 w-4" />
                      ) : uploadProgress.progress >= 90 ? (
                        <CheckIcon className="text-green-500 mr-2 h-4 w-4" />
                      ) : (
                        <ClockIcon className="text-gray-400 mr-2 h-4 w-4" />
                      )}
                      <span>Formatting notes in Notion style</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => {
                    uploadMutation.reset();
                    setUploadProgress({
                      status: 'idle',
                      progress: 0
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
