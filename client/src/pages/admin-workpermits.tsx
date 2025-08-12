import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WorkPermitStatusBadge } from "@/components/work-permit-status-badge";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import { format } from "date-fns";

type User = {
  id: string;
  displayName: string;
  email: string;
  phone: string;
};

type WorkPermit = {
  id: number;
  userId: string;
  status: "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected";
  finalDocketUrl: string | null;
  notes: string | null;
  lastUpdated: string;
  createdAt: string;
  user: User;
};

export default function AdminWorkPermitsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/admin/workpermits'],
  });

  const workPermits = ((data as any)?.workPermits || []) as WorkPermit[];

  // Filter work permits based on search term
  const filteredWorkPermits = workPermits.filter((permit) =>
    permit.user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permit.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permit.user.phone?.includes(searchTerm) ||
    permit.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: workPermits.length,
    preparation: workPermits.filter(p => p.status === "preparation").length,
    applied: workPermits.filter(p => p.status === "applied").length,
    awaiting_decision: workPermits.filter(p => p.status === "awaiting_decision").length,
    approved: workPermits.filter(p => p.status === "approved").length,
    rejected: workPermits.filter(p => p.status === "rejected").length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparation":
        return <Clock className="h-4 w-4 text-gray-500" />;
      case "applied":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "awaiting_decision":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Failed to load work permits data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Work Permits Management</h1>
        <p className="text-gray-600 mt-2">
          Manage work permit applications and track their status
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preparation</p>
                <p className="text-2xl font-bold text-gray-900">{stats.preparation}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Applied</p>
                <p className="text-2xl font-bold text-blue-900">{stats.applied}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Awaiting Decision</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.awaiting_decision}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Embassy Approved</p>
                <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Work Permits</CardTitle>
          <CardDescription>Find work permits by user name, email, phone, or status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Work Permits Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Permits ({filteredWorkPermits.length})</CardTitle>
          <CardDescription>
            Click on any work permit to manage its status and upload documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredWorkPermits.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No work permits found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "No work permit applications yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorkPermits.map((permit) => (
                <div
                  key={permit.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(permit.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {permit.user.displayName || "Unknown User"}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{permit.user.email}</span>
                          <span>•</span>
                          <span>{permit.user.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <WorkPermitStatusBadge status={permit.status} />
                        <p className="text-xs text-gray-500 mt-1">
                          Updated: {format(new Date(permit.lastUpdated), 'MMM d, yyyy')}
                        </p>
                      </div>
                      
                      <Button asChild size="sm">
                        <Link href={`/admin/workpermit/${permit.userId}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  {permit.notes && (
                    <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {permit.notes}
                    </div>
                  )}
                  
                  {permit.finalDocketUrl && (
                    <div className="mt-2 flex items-center text-sm text-green-600">
                      <FileText className="h-4 w-4 mr-1" />
                      Final docket uploaded
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}