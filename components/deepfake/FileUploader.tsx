import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { bytesToSize, isValidFileType } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelected: (file: File, dataUrl: string) => void;
  acceptedFileTypes: string[];
  maxSize: number;
  type: 'image' | 'video';
}

export default function FileUploader({
  onFileSelected,
  acceptedFileTypes,
  maxSize,
  type
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      
      if (!file) return;
      
      if (!isValidFileType(file, acceptedFileTypes)) {
        toast.error(`Invalid file type. Please upload ${acceptedFileTypes.join(', ')}`);
        return;
      }
      
      if (file.size > maxSize) {
        toast.error(`File size exceeds limit (${bytesToSize(maxSize)})`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onFileSelected(file, e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    },
    [onFileSelected, acceptedFileTypes, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false
  });

  React.useEffect(() => {
    setIsDragging(isDragActive);
  }, [isDragActive]);

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-300 dark:border-gray-700'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          {type === 'image' ? (
            <ImageIcon className="h-8 w-8 text-primary" />
          ) : (
            <Video className="h-8 w-8 text-primary" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium">
            Drop your {type} here, or <span className="text-primary">browse</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {type === 'image' ? 'PNG, JPG or GIF' : 'MP4, WEBM or MOV'} up to {bytesToSize(maxSize)}
          </p>
        </div>
        <Button variant="outline" className="mt-4">
          <Upload className="mr-2 h-4 w-4" />
          Select {type}
        </Button>
      </div>
    </div>
  );
} 