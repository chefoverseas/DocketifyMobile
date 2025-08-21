import { useAuth } from "@/hooks/use-auth";
import { UserNavigationHub } from "@/components/user-navigation-hub";
import { NotificationSystem } from "@/components/notification-system";
import { AdvancedSearch } from "@/components/advanced-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Briefcase, 
  Clock, 
  CheckCircle, 
  Activity, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  Download,
  Upload,
  Eye,
  AlertCircle,
  Star
} from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Fetch real user data
  const { data: docketData } = useQuery({
    queryKey: ['/api/docket'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: contractData } = useQuery({
    queryKey: ['/api/contracts'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workPermitData } = useQuery({
    queryKey: ['/api/work-permit'],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate real progress percentages
  const calculateDocketProgress = () => {
    if (!docketData?.docket) return 0;
    const docket = docketData.docket;
    let completed = 0;
    let total = 8; // 8 sections in docket

    // Check each section for completion
    if (docket.passportFrontUrl) completed++;
    if (docket.passportLastPageUrl) completed++;
    if (docket.passportPhotoUrl) completed++;
    if (docket.educationDocuments?.length > 0) completed++;
    if (docket.experienceDocuments?.length > 0) completed++;
    if (docket.certificationDocuments?.length > 0) completed++;
    if (docket.professionalReferences?.length > 0) completed++;
    if (docket.resumeUrl) completed++;

    return Math.round((completed / total) * 100);
  };

  const getContractStatus = () => {
    if (!contractData?.contract) return { status: 'Not Started', color: 'gray', count: 0 };
    const contract = contractData.contract;
    let pending = 0;
    let signed = 0;

    if (contract.companyContractStatus === 'pending') pending++;
    if (contract.companyContractStatus === 'signed') signed++;
    if (contract.jobOfferStatus === 'pending') pending++;
    if (contract.jobOfferStatus === 'signed') signed++;

    if (signed === 2) return { status: 'All Signed', color: 'green', count: 2 };
    if (pending > 0) return { status: `${pending} Pending`, color: 'orange', count: pending };
    return { status: 'Not Started', color: 'gray', count: 0 };
  };

  const getWorkPermitStatus = () => {
    if (!workPermitData?.workPermit) return { status: 'Not Started', color: 'gray' };
    const status = workPermitData.workPermit.status;
    
    const statusMap = {
      'preparation': { status: 'In Preparation', color: 'blue' },
      'applied': { status: 'Application Submitted', color: 'orange' },
      'awaiting_decision': { status: 'Awaiting Decision', color: 'yellow' },
      'approved': { status: 'Approved', color: 'green' },
      'rejected': { status: 'Rejected', color: 'red' }
    };
    
    return statusMap[status] || { status: 'Unknown', color: 'gray' };
  };

  const calculateOverallProgress = () => {
    const docketProgress = calculateDocketProgress();
    const contractStatus = getContractStatus();
    const workPermitStatus = getWorkPermitStatus();
    
    let score = docketProgress * 0.4; // 40% weight for docket
    
    // 30% weight for contracts
    if (contractStatus.status === 'All Signed') score += 30;
    else if (contractStatus.count > 0) score += 15;
    
    // 30% weight for work permit
    const wpStatus = workPermitStatus.status;
    if (wpStatus === 'Approved') score += 30;
    else if (wpStatus === 'Awaiting Decision') score += 20;
    else if (wpStatus === 'Application Submitted') score += 15;
    else if (wpStatus === 'In Preparation') score += 5;
    
    return Math.min(Math.round(score), 100);
  };

  // Animate progress on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(calculateDocketProgress());
    }, 500);
    return () => clearTimeout(timer);
  }, [docketData]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const docketProgress = calculateDocketProgress();
  const contractStatus = getContractStatus();
  const workPermitStatus = getWorkPermitStatus();
  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Modern Header with Glassmorphism */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={chefOverseasLogo} 
                  alt="Chef Overseas" 
                  className="h-12 w-12 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200" 
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Welcome back, {user.displayName || user.name}!
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AdvancedSearch />
              <NotificationSystem />
              <Link href="/profile">
                <Button variant="ghost" size="sm" className="hover:bg-orange-100 transition-colors">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => logout()} 
                className="hover:bg-red-100 text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Overall Progress */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 mb-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Your Journey Progress</h2>
              <p className="text-orange-100 mb-4">Track your document management and application status</p>
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold">{overallProgress}%</div>
                <div>
                  <Progress value={overallProgress} className="w-48 h-3 bg-white/20" />
                  <p className="text-sm text-orange-100 mt-1">Overall completion</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <TrendingUp className="h-16 w-16 text-white/70 mb-2" />
              <p className="text-sm text-orange-100">Keep up the great work!</p>
            </div>
          </div>
        </div>

        {/* Interactive Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Docket Progress Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  {docketProgress > 80 ? 'Almost Done' : docketProgress > 50 ? 'In Progress' : 'Getting Started'}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Document Docket</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{docketProgress}%</span>
                  <Link href="/docket">
                    <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <Progress value={animatedProgress} className="h-2" />
                <p className="text-sm text-gray-600">8 sections to complete</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Contracts Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl group-hover:opacity-80 transition-colors ${
                  contractStatus.color === 'green' ? 'bg-green-100' :
                  contractStatus.color === 'orange' ? 'bg-orange-100' : 'bg-gray-100'
                }`}>
                  <Briefcase className={`h-6 w-6 ${
                    contractStatus.color === 'green' ? 'text-green-600' :
                    contractStatus.color === 'orange' ? 'text-orange-600' : 'text-gray-600'
                  }`} />
                </div>
                <Badge variant="secondary" className={
                  contractStatus.color === 'green' ? 'bg-green-50 text-green-700' :
                  contractStatus.color === 'orange' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-700'
                }>
                  {contractStatus.color === 'green' ? 'Complete' : 'Action Needed'}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Contracts</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">{contractStatus.status}</span>
                  <Link href="/contracts">
                    <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-600">
                  {contractStatus.count > 0 ? `${contractStatus.count} documents pending` : 'All contracts processed'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Work Permit Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl group-hover:opacity-80 transition-colors ${
                  workPermitStatus.color === 'green' ? 'bg-green-100' :
                  workPermitStatus.color === 'orange' ? 'bg-orange-100' :
                  workPermitStatus.color === 'yellow' ? 'bg-yellow-100' :
                  workPermitStatus.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Clock className={`h-6 w-6 ${
                    workPermitStatus.color === 'green' ? 'text-green-600' :
                    workPermitStatus.color === 'orange' ? 'text-orange-600' :
                    workPermitStatus.color === 'yellow' ? 'text-yellow-600' :
                    workPermitStatus.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <Badge variant="secondary" className={
                  workPermitStatus.color === 'green' ? 'bg-green-50 text-green-700' :
                  workPermitStatus.color === 'orange' ? 'bg-orange-50 text-orange-700' :
                  workPermitStatus.color === 'yellow' ? 'bg-yellow-50 text-yellow-700' :
                  workPermitStatus.color === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                }>
                  {workPermitStatus.color === 'green' ? 'Approved' : 'In Process'}
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Work Permit</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{workPermitStatus.status}</span>
                  <Link href="/work-permit">
                    <Button size="sm" variant="ghost" className="text-orange-600 hover:bg-orange-50">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-600">
                  {workPermitData?.workPermit?.trackingCode ? 
                    `Tracking: ${workPermitData.workPermit.trackingCode}` : 
                    'Track your application status'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                  Priority
                </Badge>
              </div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full justify-start border-purple-200 hover:bg-purple-50" asChild>
                  <Link href="/docket">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start border-purple-200 hover:bg-purple-50" asChild>
                  <Link href="/profile">
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Recent Activity
                <Badge variant="secondary" className="ml-auto">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workPermitData?.workPermit?.status === 'approved' && (
                  <div className="flex items-start p-4 bg-green-50 rounded-lg border border-green-200 animate-pulse">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900">Work Permit Approved!</p>
                      <p className="text-sm text-green-700">Your work permit application has been approved by the embassy</p>
                      <p className="text-xs text-green-600 mt-1">
                        {workPermitData.workPermit.trackingCode && `Tracking: ${workPermitData.workPermit.trackingCode}`}
                      </p>
                    </div>
                  </div>
                )}
                
                {docketProgress > 0 && (
                  <div className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <FileText className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Docket Progress Updated</p>
                      <p className="text-sm text-gray-600">
                        {docketProgress}% of required documents uploaded
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {contractStatus.status !== 'Not Started' && (
                  <div className="flex items-start p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <Briefcase className="h-5 w-5 text-orange-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Contract Update</p>
                      <p className="text-sm text-gray-600">
                        Contract status: {contractStatus.status}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Check your contracts section for details</p>
                    </div>
                  </div>
                )}

                {docketProgress === 0 && contractStatus.status === 'Not Started' && (
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <AlertCircle className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Get Started</p>
                      <p className="text-sm text-gray-600">
                        Complete your docket to begin your application process
                      </p>
                      <Link href="/docket">
                        <Button size="sm" className="mt-2 bg-orange-500 hover:bg-orange-600">
                          Start Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-lg">
                <ArrowRight className="h-5 w-5 mr-2 text-orange-600" />
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/docket">
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50 border-blue-200">
                    <FileText className="h-4 w-4 mr-3" />
                    Document Docket
                  </Button>
                </Link>
                <Link href="/contracts">
                  <Button variant="outline" className="w-full justify-start hover:bg-green-50 border-green-200">
                    <Briefcase className="h-4 w-4 mr-3" />
                    Contracts
                  </Button>
                </Link>
                <Link href="/work-permit">
                  <Button variant="outline" className="w-full justify-start hover:bg-orange-50 border-orange-200">
                    <Clock className="h-4 w-4 mr-3" />
                    Work Permit
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start hover:bg-purple-50 border-purple-200">
                    <Settings className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Navigation Hub */}
        <UserNavigationHub />
      </div>
    </div>
  );
}