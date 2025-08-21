import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Loader } from "lucide-react";

interface SimplePhotoUploadProps {
  userId: string;
  userUid: string;
  currentPhotoUrl?: string;
  onPhotoUpdated: (newPhotoUrl: string) => void;
}

export function SimplePhotoUpload({ 
  userId, 
  userUid, 
  currentPhotoUrl, 
  onPhotoUpdated 
}: SimplePhotoUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('photo', file);

      // Step 1: Upload file to server
      const uploadResponse = await fetch('/api/admin/user-photo/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const { photoPath } = await uploadResponse.json();

      // Step 2: Update user photo URL in database
      const updateResponse = await apiRequest("PUT", `/api/admin/user/${userUid}/photo`, {
        photoPath,
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update user photo');
      }

      const { photoUrl } = await updateResponse.json();
      
      onPhotoUpdated(photoUrl);
      
      toast({
        title: "Success",
        description: "User photo updated successfully",
      });
    } catch (error) {
      console.error("Photo upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {currentPhotoUrl && (
        <img
          src={currentPhotoUrl}
          alt="Current photo"
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
        />
      )}
      
      <div className="flex flex-col space-y-2">
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id={`photo-upload-${userId}`}
        />
        
        <Button
          variant="outline"
          onClick={() => document.getElementById(`photo-upload-${userId}`)?.click()}
          disabled={isUploading}
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>{currentPhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </>
          )}
        </Button>
        
        {currentPhotoUrl && (
          <p className="text-sm text-gray-500">Photo uploaded</p>
        )}
      </div>
    </div>
  );
}