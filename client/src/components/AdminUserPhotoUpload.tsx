import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload } from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface AdminUserPhotoUploadProps {
  userId: string;
  userUid: string;
  currentPhotoUrl?: string;
  onPhotoUpdated: (newPhotoUrl: string) => void;
}

export function AdminUserPhotoUpload({ 
  userId, 
  userUid, 
  currentPhotoUrl, 
  onPhotoUpdated 
}: AdminUserPhotoUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/admin/user-photo/upload", {});
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Error getting upload parameters:", error);
      toast({
        title: "Upload Error",
        description: "Failed to prepare photo upload",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (!result.successful || result.successful.length === 0) {
      toast({
        title: "Upload Failed",
        description: "No files were uploaded successfully",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadedFile = result.successful[0];
      const photoURL = uploadedFile.uploadURL;

      // Update user photo via admin API
      const response = await apiRequest("PUT", `/api/admin/user/${userUid}/photo`, {
        photoURL,
      });

      const data = await response.json();
      
      if (response.ok) {
        onPhotoUpdated(data.photoUrl);
        toast({
          title: "Success",
          description: "User photo updated successfully",
        });
      } else {
        throw new Error(data.error || "Failed to update photo");
      }
    } catch (error) {
      console.error("Error updating user photo:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update user photo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Current Photo Preview */}
      <div className="flex-shrink-0">
        {currentPhotoUrl ? (
          <img
            src={currentPhotoUrl}
            alt="User photo"
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
            <Camera className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col space-y-2">
        <ObjectUploader
          maxNumberOfFiles={1}
          maxFileSize={5242880} // 5MB

          onGetUploadParameters={handleGetUploadParameters}
          onComplete={handleUploadComplete}
          buttonClassName={`px-4 py-2 text-sm ${
            isUploading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white rounded-md transition-colors`}
        >
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>{isUploading ? 'Uploading...' : currentPhotoUrl ? 'Change Photo' : 'Upload Photo'}</span>
          </div>
        </ObjectUploader>
        <p className="text-xs text-gray-500">
          Max 5MB • JPG, PNG, GIF
        </p>
      </div>
    </div>
  );
}