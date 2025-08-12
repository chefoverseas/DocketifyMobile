import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CheckSquare, 
  Download, 
  Mail, 
  FileText, 
  Archive,
  Trash2,
  AlertTriangle,
  Users
} from "lucide-react";

interface BulkActionsProps {
  selectedItems: string[];
  itemType: "users" | "documents" | "contracts";
  onClearSelection: () => void;
}

export function BulkActions({ selectedItems, itemType, onClearSelection }: BulkActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, items }: { action: string; items: string[] }) => {
      const res = await apiRequest("POST", "/api/admin/bulk-actions", {
        action,
        items,
        itemType
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Action Completed",
        description: `Successfully processed ${data.processed} items`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin"] });
      onClearSelection();
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Action Failed",
        description: error.message || "Failed to process bulk action",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleBulkAction = async (action: string) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items before performing bulk actions",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    bulkActionMutation.mutate({ action, items: selectedItems });
  };

  const getBulkActions = () => {
    switch (itemType) {
      case "users":
        return [
          { id: "export", label: "Export to CSV", icon: Download, variant: "default" as const },
          { id: "email", label: "Send Notification", icon: Mail, variant: "default" as const },
          { id: "activate", label: "Activate Users", icon: CheckSquare, variant: "default" as const },
          { id: "deactivate", label: "Deactivate Users", icon: Archive, variant: "destructive" as const },
        ];
      
      case "documents":
        return [
          { id: "download", label: "Download All", icon: Download, variant: "default" as const },
          { id: "approve", label: "Approve Selected", icon: CheckSquare, variant: "default" as const },
          { id: "reject", label: "Reject Selected", icon: AlertTriangle, variant: "destructive" as const },
          { id: "archive", label: "Archive Selected", icon: Archive, variant: "default" as const },
        ];
      
      case "contracts":
        return [
          { id: "download", label: "Download All", icon: Download, variant: "default" as const },
          { id: "approve", label: "Approve Selected", icon: CheckSquare, variant: "default" as const },
          { id: "reject", label: "Reject Selected", icon: AlertTriangle, variant: "destructive" as const },
          { id: "remind", label: "Send Reminders", icon: Mail, variant: "default" as const },
        ];
      
      default:
        return [];
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  const actions = getBulkActions();

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-5 w-5 text-orange-600" />
              <span className="font-medium text-orange-900">
                {selectedItems.length} {itemType} selected
              </span>
            </div>
            
            <Badge variant="outline" className="bg-white">
              Bulk Actions Available
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant={action.variant}
                  size="sm"
                  onClick={() => handleBulkAction(action.id)}
                  disabled={isProcessing}
                  className="flex items-center space-x-1"
                >
                  <Icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Button>
              );
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isProcessing}
            >
              Clear Selection
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 pt-3 border-t border-orange-200">
          <div className="flex items-center space-x-6 text-sm text-orange-700">
            <span>Quick Actions:</span>
            <button 
              className="hover:underline"
              onClick={() => handleBulkAction("selectAll")}
            >
              Select All
            </button>
            <button 
              className="hover:underline"
              onClick={() => handleBulkAction("selectNone")}
            >
              Select None
            </button>
            <button 
              className="hover:underline"
              onClick={() => handleBulkAction("selectPending")}
            >
              Select Pending Only
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}