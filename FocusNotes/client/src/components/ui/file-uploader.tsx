import { useCallback, useState } from "react";
import { Button } from "./button";
import { Upload, FileVideo, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  maxSize?: number; // in bytes
  accept?: string[] | Record<string, string[]>;
  className?: string;
}

export function FileUploader({
  onFileSelect,
  maxSize = 200 * 1024 * 1024, // 200MB default
  accept = {
    'video/mp4': ['.mp4'],
    'video/quicktime': ['.mov'],
  },
  className,
}: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const file = acceptedFiles[0];
    
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${Math.floor(maxSize / (1024 * 1024))}MB.`);
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  }, [maxSize, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    maxSize,
  });

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors cursor-pointer",
        isDragActive ? "border-primary bg-primary/5" : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50",
        className
      )}
    >
      <input {...getInputProps()} />
      
      {selectedFile ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center mb-3">
            <FileVideo className="h-8 w-8 text-primary dark:text-primary" />
            <span className="ml-2 text-sm font-medium">{selectedFile.name}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2 h-6 w-6"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
      ) : (
        <>
          <div className="text-primary dark:text-primary mb-3">
            <Upload className="h-10 w-10 mx-auto" />
          </div>
          <p className="text-gray-700 dark:text-gray-200 font-medium mb-1">
            {isDragActive ? "Drop your video file here" : "Drag and drop your video file here"}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">or click to browse (.mp4, .mov)</p>
          <Button>Choose Video</Button>
        </>
      )}
      
      {error && (
        <div className="mt-3 text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}
