import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { 
  User, 
  FileText, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  FileCheck,
  Phone,
  Mail,
  Calendar,
  MapPin
} from "lucide-react";
import { format } from "date-fns";

interface UserNavigationHubProps {
  userId?: string;
  showUserInfo?: boolean;
}

export function UserNavigationHub({ userId, showUserInfo = false }: UserNavigationHubProps) {
  // If userId is provided, fetch that user's data (admin view)
  // Otherwise, fetch current user's data (user view)
  const { data: userData, error: userError, isLoading: userLoading } = useQuery({
    queryKey: userId ? [`/api/admin/user/${userId}`] : ['/api/auth/me'],
    enabled: true, // Always enabled
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  const { data: docketData } = useQuery({
    queryKey: userId ? [`/api/admin/docket/${userId}`] : ['/api/docket'],
    enabled: !!userData && !!userId, // Only fetch when user data is available and userId is provided
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });

  const { data: contractData } = useQuery({
    queryKey: userId ? [`/api/admin/contract/${userId}`] : ['/api/contracts'],
    enabled: !!userData && !!userId, // Only fetch when user data is available and userId is provided
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });

  const { data: workPermitData } = useQuery({
    queryKey: userId ? [`/api/admin/workpermit/${userId}`] : ['/api/workpermit'],
    enabled: !!userData && !!userId, // Only fetch when user data is available and userId is provided
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });

  const user = userId ? (userData as any) : (userData as any)?.user;
  const docket = userId ? (docketData as any)?.docket : (docketData as any)?.docket;
  const contract = userId ? (contractData as any)?.contract : (contractData as any)?.contract;
  const workPermit = userId ? (workPermitData as any)?.workPermit : (workPermitData as any)?.workPermit;

  // Show loading state
  if (userLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state with user-friendly message
  if (userError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userId ? "User Details Not Available" : "Authentication Required"}
              </h3>
              <p className="text-gray-500 mb-4">
                {userId 
                  ? "Unable to load user details. The user may not exist or you may not have permission to view their information."
                  : "Please log in to view your dashboard."
                }
              </p>
              {userId && (
                <Link href="/admin/users">
                  <Button variant="outline">
                    Back to Users List
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateDocketProgress = () => {
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

  const getContractStatus = () => {
    if (!contract) return { status: "Not Started", color: "bg-gray-100 text-gray-800" };
    
    const companyComplete = contract.companyContractStatus === "signed";
    const jobOfferComplete = contract.jobOfferStatus === "signed";
    
    if (companyComplete && jobOfferComplete) {
      return { status: "Completed", color: "bg-green-100 text-green-800" };
    } else if (contract.companyContractOriginalUrl || contract.jobOfferOriginalUrl) {
      return { status: "In Progress", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { status: "Pending", color: "bg-gray-100 text-gray-800" };
    }
  };

  const getWorkPermitStatus = () => {
    if (!workPermit) return { status: "Not Started", color: "bg-gray-100 text-gray-800" };
    
    switch (workPermit.status) {
      case "approved":
        return { status: "Approved", color: "bg-green-100 text-green-800" };
      case "applied":
        return { status: "Applied", color: "bg-blue-100 text-blue-800" };
      case "preparation":
        return { status: "In Preparation", color: "bg-yellow-100 text-yellow-800" };
      case "rejected":
        return { status: "Rejected", color: "bg-red-100 text-red-800" };
      default:
        return { status: "Not Started", color: "bg-gray-100 text-gray-800" };
    }
  };

  const docketProgress = calculateDocketProgress();
  const contractStatus = getContractStatus();
  const workPermitStatus = getWorkPermitStatus();

  const baseUrl = userId ? `/admin` : '';



  // If we're in admin mode (userId provided) but don't have user data yet, show loading
  if (userId && !userData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user information...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we're in admin mode and have no user data after loading, show error
  if (userId && userData && !user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Information Unavailable</h3>
              <p className="text-gray-600">Unable to load user details at this time.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info Card - Only show if requested */}
      {showUserInfo && user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-lg font-semibold text-gray-900">{user.displayName}</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{user.phone}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Joined</p>
                  <p className="text-sm text-gray-900">
                    {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Hub Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Docket Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-blue-600" />
                Document Docket
              </div>
              <Badge className={
                docketProgress.percentage === 100 ? "bg-green-100 text-green-800" :
                docketProgress.percentage > 50 ? "bg-yellow-100 text-yellow-800" :
                docketProgress.percentage > 0 ? "bg-blue-100 text-blue-800" :
                "bg-gray-100 text-gray-800"
              }>
                {docketProgress.completed}/{docketProgress.total}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(docketProgress.percentage)}%</span>
              </div>
              <Progress value={docketProgress.percentage} className="h-2" />
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Passport Documents</span>
                {docket?.passportFrontUrl ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-gray-400" />}
              </div>
              <div className="flex items-center justify-between">
                <span>Personal Documents</span>
                {docket?.resumeUrl ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-gray-400" />}
              </div>
              <div className="flex items-center justify-between">
                <span>References</span>
                {(docket?.references as any)?.length >= 2 ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Clock className="h-4 w-4 text-gray-400" />}
              </div>
            </div>
            
            <Link href={userId ? `/admin/docket/${userId}` : '/docket'}>
              <Button className="w-full">
                View Docket
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Contract Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Contracts
              </div>
              <Badge className={contractStatus.color}>
                {contractStatus.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Company Contract</span>
                {contract?.companyContractStatus === "signed" ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  contract?.companyContractOriginalUrl ? 
                    <Clock className="h-4 w-4 text-yellow-600" /> : 
                    <Clock className="h-4 w-4 text-gray-400" />
                }
              </div>
              <div className="flex items-center justify-between">
                <span>Job Offer</span>
                {contract?.jobOfferStatus === "signed" ? 
                  <CheckCircle className="h-4 w-4 text-green-600" /> : 
                  contract?.jobOfferOriginalUrl ? 
                    <Clock className="h-4 w-4 text-yellow-600" /> : 
                    <Clock className="h-4 w-4 text-gray-400" />
                }
              </div>
            </div>
            
            {contract?.lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {format(new Date(contract.lastUpdated), 'MMM dd, yyyy')}
              </p>
            )}
            
            <Link href={userId ? `/admin/contracts/${userId}` : '/contracts'}>
              <Button className="w-full" variant="outline">
                View Contracts
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Work Permit Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                Work Permit
              </div>
              <Badge className={workPermitStatus.color}>
                {workPermitStatus.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workPermit && (
              <div className="space-y-2 text-sm text-gray-600">
                {workPermit.trackingCode && (
                  <div>
                    <p className="font-medium">Tracking Code</p>
                    <p className="font-mono text-xs bg-gray-100 p-1 rounded">{workPermit.trackingCode}</p>
                  </div>
                )}
                {workPermit.applicationDate && (
                  <div>
                    <p className="font-medium">Application Date</p>
                    <p>{format(new Date(workPermit.applicationDate), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
            )}
            
            {workPermit?.lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {format(new Date(workPermit.lastUpdated), 'MMM dd, yyyy')}
              </p>
            )}
            
            <Link href={userId ? `/admin/workpermit/${userId}` : '/workpermit'}>
              <Button className="w-full" variant="outline">
                View Work Permit
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Profile Card for User View */}
      {!userId && (
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-indigo-600" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Update your personal information and contact details.
            </p>
            <Link href="/profile">
              <Button variant="outline" className="w-full">
                Manage Profile
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}