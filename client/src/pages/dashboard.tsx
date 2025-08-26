import { useAuth } from "@/hooks/use-auth";
import { NotificationSystem } from "@/components/notification-system";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  FileText, 
  Briefcase, 
  Calendar,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plane,
  User,
  Settings,
  Bell,
  Activity,
  Download
} from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [animatedStats, setAnimatedStats] = useState({
    docket: 0,
    overall: 0
  });
  
  // Fetch user data with better error handling
  const { data: docketData, isLoading: docketLoading } = useQuery({
    queryKey: ['/api/docket'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: contractData, isLoading: contractLoading } = useQuery({
    queryKey: ['/api/contracts'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workPermitData, isLoading: workPermitLoading } = useQuery({
    queryKey: ['/api/work-permit'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workVisaData, isLoading: workVisaLoading } = useQuery({
    queryKey: ['/api/work-visa'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Smart analytics calculations
  const calculateDocketCompletion = () => {
    if (!(docketData as any)?.docket) return { percentage: 0, completed: 0, total: 8 };
    
    const docket = (docketData as any).docket;
    const checks = [
      !!docket.passportFrontUrl,
      !!docket.passportLastUrl,
      !!docket.passportPhotoUrl,
      !!docket.resumeUrl,
      docket.educationFiles?.length > 0,
      docket.experienceFiles?.length > 0,
      docket.references?.length > 0,
      !!docket.permanentAddressUrl
    ];
    
    const completed = checks.filter(Boolean).length;
    return { 
      percentage: Math.round((completed / checks.length) * 100), 
      completed, 
      total: checks.length 
    };
  };

  const getApplicationStats = () => {
    const docketCompletion = calculateDocketCompletion();
    
    const contract = (contractData as any)?.contract;
    const contractSigned = contract?.companyContractStatus === 'signed' || contract?.jobOfferStatus === 'signed';
    
    const workPermit = (workPermitData as any)?.workPermit;
    const workPermitApproved = workPermit?.status === 'approved';
    
    const workVisa = (workVisaData as any)?.workVisa;
    const workVisaApproved = workVisa?.status === 'approved';
    
    // Calculate overall progress
    let overallScore = 0;
    overallScore += docketCompletion.percentage * 0.4; // 40% weight
    overallScore += contractSigned ? 25 : 0; // 25% weight
    overallScore += workPermitApproved ? 20 : (workPermit?.status === 'applied' ? 10 : 0); // 20% weight
    overallScore += workVisaApproved ? 15 : (workVisa?.status === 'applied' ? 7 : 0); // 15% weight
    
    return {
      docketCompletion,
      contractSigned,
      workPermitApproved,
      workVisaApproved,
      overallProgress: Math.min(Math.round(overallScore), 100),
      workPermit,
      workVisa,
      contract
    };
  };

  const stats = getApplicationStats();

  // Animate counters on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedStats({
        docket: stats.docketCompletion.percentage,
        overall: stats.overallProgress
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [stats.docketCompletion.percentage, stats.overallProgress]);

  if (!user || docketLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'applied': 'bg-blue-100 text-blue-800 border-blue-200',
      'preparation': 'bg-orange-100 text-orange-800 border-orange-200',
      'signed': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, any> = {
      'approved': CheckCircle2,
      'applied': Clock,
      'preparation': Activity,
      'signed': CheckCircle2,
      'pending': Clock,
      'rejected': AlertCircle,
    };
    return iconMap[status] || Clock;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Modern Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <Avatar className="h-16 w-16 ring-4 ring-orange-100">
                <AvatarImage src={user.profileImageUrl || user.photoUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white text-lg font-bold">
                  {(() => {
                    const firstName = user.firstName || user.givenName || '';
                    const lastName = user.lastName || user.surname || '';
                    if (firstName && lastName) {
                      return (firstName[0] + lastName[0]).toUpperCase();
                    }
                    if (firstName) return firstName[0].toUpperCase();
                    if (user.displayName) return user.displayName[0].toUpperCase();
                    return user.email?.[0]?.toUpperCase() || 'U';
                  })()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {(() => {
                    const firstName = user.firstName || user.givenName;
                    const displayName = user.displayName;
                    if (firstName) return firstName;
                    if (displayName) return displayName.split(' ')[0];
                    return user.email?.split('@')[0] || 'User';
                  })()}
                </h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <NotificationSystem />
              <Button asChild variant="outline" className="border-orange-200 hover:bg-orange-50">
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Overall Progress */}
          <Card className="border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Overall Progress</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{animatedStats.overall}%</div>
              <Progress value={animatedStats.overall} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">Complete your application journey</p>
            </CardContent>
          </Card>

          {/* Docket Completion */}
          <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Document Docket</CardTitle>
              <FileText className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 mb-2">{animatedStats.docket}%</div>
              <Progress value={animatedStats.docket} className="h-2 mb-2" />
              <p className="text-xs text-gray-500">
                {stats.docketCompletion.completed} of {stats.docketCompletion.total} sections complete
              </p>
            </CardContent>
          </Card>

          {/* Contracts Status */}
          <Card className="border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Contracts</CardTitle>
              <Briefcase className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats.contractSigned ? 'Signed' : stats.contract ? 'Pending' : 'Awaiting'}
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(stats.contractSigned ? 'signed' : 'pending')}`}
              >
                {stats.contractSigned ? 'All Complete' : 'Action Required'}
              </Badge>
            </CardContent>
          </Card>

          {/* Travel Status */}
          <Card className="border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Travel Ready</CardTitle>
              <Plane className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {stats.workPermitApproved && stats.workVisaApproved ? 'Ready' : 'In Progress'}
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(stats.workPermitApproved && stats.workVisaApproved ? 'approved' : 'preparation')}`}
              >
                {stats.workPermitApproved && stats.workVisaApproved ? 'Travel Approved' : 'Processing'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-orange-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start bg-orange-500 hover:bg-orange-600" size="lg">
                  <Link href="/docket">
                    <FileText className="h-5 w-5 mr-3" />
                    Complete Documents
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start border-blue-200 hover:bg-blue-50" size="lg">
                  <Link href="/contracts">
                    <Briefcase className="h-5 w-5 mr-3" />
                    Review Contracts
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start border-green-200 hover:bg-green-50" size="lg">
                  <Link href="/workpermit">
                    <Clock className="h-5 w-5 mr-3" />
                    Work Permit Status
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start border-purple-200 hover:bg-purple-50" size="lg">
                  <Link href="/workvisa">
                    <Plane className="h-5 w-5 mr-3" />
                    Visa Application
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Application Status Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Work Permit Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${stats.workPermitApproved ? 'bg-green-100' : 'bg-orange-100'}`}>
                      {(() => {
                        const IconComponent = getStatusIcon(stats.workPermit?.status || 'preparation');
                        return <IconComponent className={`h-5 w-5 ${stats.workPermitApproved ? 'text-green-600' : 'text-orange-600'}`} />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Work Permit</h3>
                      <p className="text-sm text-gray-600">Processing your work authorization</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(stats.workPermit?.status || 'preparation')}
                  >
                    {stats.workPermit?.status?.replace('_', ' ').toUpperCase() || 'NOT STARTED'}
                  </Badge>
                </div>

                {/* Work Visa Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${stats.workVisaApproved ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {(() => {
                        const IconComponent = getStatusIcon(stats.workVisa?.status || 'preparation');
                        return <IconComponent className={`h-5 w-5 ${stats.workVisaApproved ? 'text-green-600' : 'text-blue-600'}`} />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Work Visa</h3>
                      <p className="text-sm text-gray-600">Embassy processing and approval</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(stats.workVisa?.status || 'preparation')}
                  >
                    {stats.workVisa?.status?.replace('_', ' ').toUpperCase() || 'NOT STARTED'}
                  </Badge>
                </div>

                {/* Next Steps */}
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Bell className="h-4 w-4 mr-2 text-orange-500" />
                    Next Steps
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    {stats.docketCompletion.percentage < 100 && (
                      <p>• Complete your document docket ({stats.docketCompletion.completed}/{stats.docketCompletion.total} sections done)</p>
                    )}
                    {!stats.contractSigned && stats.contract && (
                      <p>• Review and sign your employment contracts</p>
                    )}
                    {!stats.workPermitApproved && (
                      <p>• Monitor your work permit application status</p>
                    )}
                    {stats.workPermitApproved && !stats.workVisaApproved && (
                      <p>• Submit your work visa application</p>
                    )}
                    {stats.workPermitApproved && stats.workVisaApproved && (
                      <p>🎉 Congratulations! You're ready to travel.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}