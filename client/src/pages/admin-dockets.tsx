import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Search, 
  User, 
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";

interface DocketUser {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  docketCompleted: boolean;
  createdAt: string;
  docket?: {
    id: number;
    lastUpdated: string;
    passportFrontUrl: string | null;
    passportLastUrl: string | null;
    passportPhotoUrl: string | null;
    resumeUrl: string | null;
    educationFiles: any[];
    experienceFiles: any[];
    offerLetterUrl: string | null;
    permanentAddressUrl: string | null;
    currentAddressUrl: string | null;
    otherCertifications: any[];
    references: any[];
  };
}

export default function AdminDocketsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!(adminData as any)?.admin,
  });

  const { data: docketsData, isLoading: docketsLoading } = useQuery({
    queryKey: ["/api/admin/dockets"],
    enabled: !!(adminData as any)?.admin,
  });

  if (adminLoading || usersLoading || docketsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading docket data...</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const users: DocketUser[] = (usersData as any)?.users || [];
  const dockets = (docketsData as any)?.dockets || [];

  // Merge user and docket data
  const usersWithDockets = users.map(user => ({
    ...user,
    docket: dockets.find((d: any) => d.userId === user.id)
  }));

  // Filter users based on search term
  const filteredUsers = usersWithDockets.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid?.includes(searchTerm)
  );

  const calculateDocketProgress = (docket: any) => {
    if (!docket) return { completed: 0, total: 9, percentage: 0 };
    
    const sections = [
      !!docket.passportFrontUrl,
      !!docket.passportPhotoUrl,
      !!docket.resumeUrl,
      docket.educationFiles?.length > 0,
      docket.experienceFiles?.length > 0,
      !!docket.offerLetterUrl,
      !!docket.permanentAddressUrl,
      docket.otherCertifications?.length > 0,
      docket.references?.length >= 2
    ];
    
    const completed = sections.filter(Boolean).length;
    const total = sections.length;
    const percentage = (completed / total) * 100;
    
    return { completed, total, percentage };
  };

  const getDocketStatusBadge = (progress: { completed: number; total: number; percentage: number }) => {
    if (progress.percentage === 100) {
      return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Complete</Badge>;
    } else if (progress.percentage > 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
    } else if (progress.percentage > 0) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="h-3 w-3 mr-1" />Started</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200"><XCircle className="h-3 w-3 mr-1" />Not Started</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Docket Management
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  View and manage user document dockets
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or UID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Dockets</p>
                  <p className="text-2xl font-bold text-gray-900">{usersWithDockets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usersWithDockets.filter(u => calculateDocketProgress(u.docket).percentage === 100).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usersWithDockets.filter(u => {
                      const progress = calculateDocketProgress(u.docket);
                      return progress.percentage > 0 && progress.percentage < 100;
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Not Started</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {usersWithDockets.filter(u => calculateDocketProgress(u.docket).percentage === 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dockets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              User Dockets ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No dockets found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const progress = calculateDocketProgress(user.docket);
                  return (
                    <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {user.displayName}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>UID: {user.uid}</span>
                              <span>•</span>
                              <span>{user.email}</span>
                              <span>•</span>
                              <span>{user.phone}</span>
                            </div>
                            {user.docket?.lastUpdated && (
                              <div className="flex items-center mt-1 text-xs text-gray-400">
                                <Calendar className="h-3 w-3 mr-1" />
                                Last updated: {format(new Date(user.docket.lastUpdated), 'MMM dd, yyyy HH:mm')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              {getDocketStatusBadge(progress)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {progress.completed}/{progress.total} sections complete
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <Link href={`/admin/docket/${user.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}