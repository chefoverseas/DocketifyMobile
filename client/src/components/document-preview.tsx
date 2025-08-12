import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, FileText, Image, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface DocumentPreviewProps {
  url: string;
  filename: string;
  type: "image" | "pdf" | "document";
  onClose: () => void;
}

export function DocumentPreview({ url, filename, type, onClose }: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  const renderPreview = () => {
    switch (type) {
      case "image":
        return (
          <div className="flex justify-center items-center h-full bg-gray-100 rounded">
            <img
              src={url}
              alt={filename}
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: "transform 0.3s ease",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain"
              }}
            />
          </div>
        );
      
      case "pdf":
        return (
          <div className="h-full bg-gray-100 rounded flex items-center justify-center">
            <iframe
              src={`${url}#view=FitH`}
              className="w-full h-full border-none rounded"
              title={filename}
              style={{ minHeight: "600px" }}
            />
          </div>
        );
      
      default:
        return (
          <div className="h-full bg-gray-100 rounded flex flex-col items-center justify-center p-8">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{filename}</h3>
            <p className="text-gray-600 text-center mb-6">
              This document type cannot be previewed directly. Click download to view.
            </p>
            <Button asChild>
              <a href={url} download={filename}>
                <Download className="h-4 w-4 mr-2" />
                Download Document
              </a>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                {type === "image" ? (
                  <Image className="h-5 w-5 mr-2" />
                ) : (
                  <FileText className="h-5 w-5 mr-2" />
                )}
                {filename}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">{type.toUpperCase()}</Badge>
                {type === "image" && (
                  <Badge variant="outline">{zoom}%</Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {type === "image" && (
                <>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRotate}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Reset
                  </Button>
                </>
              )}
              
              <Button variant="outline" size="sm" asChild>
                <a href={url} download={filename}>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
              
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden p-6">
          {renderPreview()}
        </CardContent>
      </Card>
    </div>
  );
}