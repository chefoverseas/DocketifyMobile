import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload, File, Upload, Loader2 } from "lucide-react";

interface ContractUploaderProps {
  onUpload: (file: File) => void;
  accept?: string;
  description?: string;
  disabled?: boolean;
}

export default function ContractUploader({
  onUpload,
  accept = ".pdf",
  description,
  disabled = false,
}: ContractUploaderProps) {
  const { toast } = useToast();
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0 || disabled) return;
    
    const file = acceptedFiles[0];
    
    // Validate file type
    if (!file.type.includes('pdf')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }

    onUpload(file);
  }, [onUpload, disabled, toast]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <Card className={`border-2 border-dashed transition-colors ${
      isDragActive 
        ? "border-blue-400 bg-blue-50" 
        : disabled
        ? "border-gray-200 bg-gray-50"
        : "border-gray-300 hover:border-gray-400"
    }`}>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`text-center space-y-4 ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          <input {...getInputProps()} disabled={disabled} />
          
          <div className="flex justify-center">
            {disabled ? (
              <Loader2 className="h-12 w-12 text-gray-400 animate-spin" />
            ) : (
              <div className={`p-3 rounded-full ${
                isDragActive ? "bg-blue-200" : "bg-gray-100"
              }`}>
                <CloudUpload className={`h-8 w-8 ${
                  isDragActive ? "text-blue-600" : "text-gray-600"
                }`} />
              </div>
            )}
          </div>
          
          <div>
            <p className={`text-lg font-medium ${
              disabled ? "text-gray-400" : "text-gray-900"
            }`}>
              {disabled ? "Uploading..." : isDragActive ? "Drop your PDF here" : "Drop your signed PDF here"}
            </p>
            <p className={`text-sm ${
              disabled ? "text-gray-400" : "text-gray-500"
            }`}>
              {description || "Or click to browse files"}
            </p>
            {!disabled && (
              <p className="text-xs text-gray-400 mt-1">
                PDF files only, up to 10MB
              </p>
            )}
          </div>
          
          {!disabled && (
            <Button variant="outline" size="sm" className="mt-4">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}