import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WorkPermitStatusBadge } from "@/components/work-permit-status-badge";
import { useState } from "react";
import { Link } from "wouter";
import { Search, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, ArrowLeft, Filter, Building2, User, Calendar, Phone, Mail, Edit, TrendingUp } from "lucide-react";
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

  // Transform the API response to match expected structure
  const workPermitsData = ((data as any)?.workPermits || []);
  const workPermits = workPermitsData.map((item: any) => ({
    id: item.workPermit?.id || item.user.id, // Use work permit ID if available, otherwise user ID
    userId: item.user.id,
    status: item.workPermit?.status || "preparation",
    finalDocketUrl: item.workPermit?.finalDocketUrl || null,
    notes: item.workPermit?.notes || null,
    lastUpdated: item.workPermit?.lastUpdated || item.user.createdAt,
    createdAt: item.workPermit?.createdAt || item.user.createdAt,
    user: item.user
  })) as WorkPermit[];

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading work permits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 p-8">
        <div className="container mx-auto">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load work permits data. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Modern Header Section */}
        <Card className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white border-none shadow-2xl mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold">Work Permits Management</h1>
                    <p className="text-orange-100 text-lg mt-1">
                      Comprehensive oversight of work permit applications and status tracking
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-sm text-orange-100">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{stats.total} Total Applications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>{stats.approved} Approved</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{stats.awaiting_decision} Pending</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button 
                  asChild
                  variant="outline" 
                  size="sm"
                  className="bg-white/50 hover:bg-white/80 border-white/30"
                >
                  <Link href="/admin/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, email, phone, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 bg-white/70 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                </div>
              </div>
              <Button variant="outline" className="h-12 px-6">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Work Permits Grid */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            {filteredWorkPermits.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl w-fit mx-auto mb-6">
                  <FileText className="h-16 w-16 text-orange-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No Work Permits Found
                </h3>
                <p className="text-gray-500 text-lg">
                  {searchTerm
                    ? "No work permits match your search criteria. Try adjusting your search."
                    : "No work permit applications have been created yet."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWorkPermits.map((permit) => (
                  <Card 
                    key={permit.id} 
                    className="bg-gradient-to-br from-white to-gray-50 border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-white">
                              {permit.user.displayName ? permit.user.displayName[0] : "U"}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                              {permit.user.displayName || "Unnamed User"}
                            </h3>
                            <p className="text-sm text-gray-600">{permit.user.email}</p>
                          </div>
                        </div>
                        <WorkPermitStatusBadge status={permit.status} />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-700">
                          <Phone className="h-4 w-4 mr-2 text-orange-500" />
                          <span>{permit.user.phone}</span>
                        </div>
                        
                        {permit.lastUpdated && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                            <span>Updated: {format(new Date(permit.lastUpdated), "MMM dd, yyyy")}</span>
                          </div>
                        )}
                        
                        {permit.notes && (
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="text-xs text-gray-600 mb-1">Notes</div>
                            <div className="text-sm text-gray-900">{permit.notes}</div>
                          </div>
                        )}
                        
                        {permit.finalDocketUrl && (
                          <div className="flex items-center text-sm text-green-700 bg-green-50 rounded p-2">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            <span className="font-medium">Final docket uploaded</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full group-hover:bg-orange-50 group-hover:border-orange-300 transition-colors"
                        >
                          <Link href={`/admin/workpermit/${permit.userId}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Manage Application
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}