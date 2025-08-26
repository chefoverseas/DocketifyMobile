import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, File, Image, Trash2, Eye } from "lucide-react";

interface FileData {
  name: string;
  url: string;
  size: number;
}

interface FileUploaderProps {
  currentFile?: string;
  currentFiles?: FileData[];
  onUpload: (fileData: FileData | FileData[]) => void;
  multiple?: boolean;
  accept?: string;
  description?: string;
}

export default function FileUploader({
  currentFile,
  currentFiles = [],
  onUpload,
  multiple = false,
  accept = "image/*,application/pdf",
  description,
}: FileUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      return response.json();
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    
    try {
      if (multiple) {
        const uploadPromises = acceptedFiles.map(file => uploadMutation.mutateAsync(file));
        const uploadedFiles = await Promise.all(uploadPromises);
        // Extract the file data from the API response for multiple files
        const fileData = uploadedFiles.map(response => ({
          name: response.file.originalName,
          url: response.file.url,
          size: response.file.size
        }));
        const newFiles = [...currentFiles, ...fileData];
        onUpload(newFiles);
      } else {
        const uploadedFile = await uploadMutation.mutateAsync(acceptedFiles[0]);
        // Extract the file data from the API response for single file
        const fileData = {
          name: uploadedFile.file.originalName,
          url: uploadedFile.file.url,
          size: uploadedFile.file.size
        };
        onUpload(fileData);
      }
      
      toast({
        title: "Success",
        description: `File${multiple && acceptedFiles.length > 1 ? 's' : ''} uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [currentFiles, multiple, onUpload, uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.includes('.doc') || accept.includes('.docx') ? {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    } : {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple,
  });

  const handleRemoveFile = (index: number) => {
    if (multiple) {
      const newFiles = currentFiles.filter((_, i) => i !== index);
      onUpload(newFiles);
    } else {
      onUpload({ name: "", url: "", size: 0 });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    if (!filename || typeof filename !== 'string') {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('.pdf')) {
      return <File className="h-5 w-5 text-red-500" />;
    }
    if (lowerName.includes('.doc') || lowerName.includes('.docx')) {
      return <File className="h-5 w-5 text-blue-600" />;
    }
    return <Image className="h-5 w-5 text-blue-500" />;
  };

  // Single file display
  if (!multiple && currentFile) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(typeof currentFile === 'string' ? currentFile : (currentFile as any)?.name || '')}
              <div>
                <p className="text-sm font-medium text-green-700">File uploaded</p>
                <p className="text-xs text-green-600">Click to replace</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(typeof currentFile === 'string' ? currentFile : (currentFile as any)?.url || '', '_blank')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(0)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          <div
            {...getRootProps()}
            className="mt-2 cursor-pointer"
          >
            <input {...getInputProps()} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Multiple files display
  if (multiple && currentFiles.length > 0) {
    return (
      <div className="space-y-4">
        {currentFiles.map((file, index) => (
          <Card key={index} className="border-2 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.name)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Card 
          {...getRootProps()}
          className={`border-2 border-dashed cursor-pointer transition-colors ${
            isDragActive 
              ? "border-primary bg-primary/5" 
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <CardContent className="p-6">
            <input {...getInputProps()} />
            <div className="text-center space-y-2">
              <CloudUpload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {uploading ? "Uploading..." : "Click to upload more files"}
              </p>
              <p className="text-xs text-gray-400">{description || "PNG, JPG, PDF up to 10MB each"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Upload dropzone
  return (
    <Card 
      {...getRootProps()}
      className={`border-2 border-dashed cursor-pointer transition-colors ${
        isDragActive 
          ? "border-primary bg-primary/5" 
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <CardContent className="p-6">
        <input {...getInputProps()} />
        <div className="text-center space-y-2">
          <CloudUpload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-600">
            {uploading 
              ? "Uploading..." 
              : isDragActive 
              ? "Drop files here..." 
              : "Click to upload or drag and drop"
            }
          </p>
          <p className="text-xs text-gray-400">{description || "PNG, JPG, PDF up to 10MB each"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
