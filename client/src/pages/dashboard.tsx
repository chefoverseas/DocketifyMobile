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
  Star,
  User,
  MoreHorizontal
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
    let total = 10; // 10 main sections in docket

    // Check each section for completion based on actual schema fields
    if (docket.passportFrontUrl) completed++;
    if (docket.passportLastUrl) completed++; // Correct field name
    if (docket.passportPhotoUrl) completed++;
    if (docket.resumeUrl) completed++;
    if (docket.educationFiles?.length > 0) completed++; // Correct field name
    if (docket.experienceFiles?.length > 0) completed++; // Correct field name
    if (docket.otherCertifications?.length > 0) completed++; // Correct field name
    if (docket.references?.length > 0) completed++; // Correct field name
    if (docket.permanentAddressUrl) completed++;
    if (docket.currentAddressUrl) completed++;

    return Math.round((completed / total) * 100);
  };

  const getContractStatus = () => {
    if (!contractData?.contract) return { status: 'Not Started', color: 'gray', count: 0 };
    const contract = contractData.contract;
    let pending = 0;
    let signed = 0;
    let available = 0;

    // Check company contract
    if (contract.companyContractOriginalUrl) {
      available++;
      if (contract.companyContractStatus === 'pending') pending++;
      if (contract.companyContractStatus === 'signed') signed++;
    }

    // Check job offer
    if (contract.jobOfferOriginalUrl) {
      available++;
      if (contract.jobOfferStatus === 'pending') pending++;
      if (contract.jobOfferStatus === 'signed') signed++;
    }

    if (available === 0) return { status: 'Awaiting Documents', color: 'gray', count: 0 };
    if (signed === available && signed > 0) return { status: 'All Signed', color: 'green', count: signed };
    if (pending > 0) return { status: `${pending} Pending`, color: 'orange', count: pending };
    return { status: 'Ready to Sign', color: 'blue', count: available };
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
      {/* Modern Navigation Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-6">
              <img 
                src={chefOverseasLogo} 
                alt="Chef Overseas" 
                className="h-16 w-auto object-contain rounded-lg shadow-md" 
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Docketify Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <AdvancedSearch />
              <NotificationSystem />
              <Button 
                variant="ghost" 
                onClick={() => logout()} 
                className="hover:bg-red-100 text-red-600 transition-colors px-4 py-2"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        
        {/* User Profile Header Card */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-r from-white via-orange-50 to-red-50 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-10 py-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Profile Photo */}
                <div className="relative group">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-white to-orange-100">
                    {user?.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt={user.displayName || user.name || 'Profile'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-white">
                        <User className="h-16 w-16 md:h-20 md:w-20 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left text-white">
                  <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
                    Welcome back, {user?.displayName || user?.name || 'User'}!
                  </h1>
                  <p className="text-orange-100 mb-3 text-xl leading-relaxed">
                    ID: {user?.uid || 'Not assigned'} • Member since {new Date().getFullYear()}
                  </p>
                  <p className="text-white/90 mb-6 flex items-center justify-center md:justify-start text-lg">
                    <Calendar className="h-5 w-5 mr-3" />
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-3 py-2 text-sm">
                      <User className="h-4 w-4 mr-2" />
                      Active User
                    </Badge>
                    {docketData?.docket && (
                      <Badge className="bg-green-500/20 text-white border-green-300/30 px-3 py-2 text-sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Docket Created
                      </Badge>
                    )}
                    {contractData?.contract && (
                      <Badge className="bg-blue-500/20 text-white border-blue-300/30 px-3 py-2 text-sm">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Contract Active
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col space-y-4">
                  <Link href="/profile">
                    <Button 
                      variant="secondary" 
                      className="bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all backdrop-blur-sm px-6 py-3 text-base"
                    >
                      <Settings className="h-5 w-5 mr-3" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="text-white/70 hover:text-white hover:bg-white/10 px-4 py-2"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Row */}
            <div className="bg-white px-10 py-6">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-6 text-center">
                <div className="py-2">
                  <div className="text-3xl font-bold text-orange-600 mb-1">{overallProgress}%</div>
                  <div className="text-sm text-gray-600 font-medium">Overall Progress</div>
                </div>
                <div className="py-2">
                  <div className="text-3xl font-bold text-blue-600 mb-1">{docketProgress}%</div>
                  <div className="text-sm text-gray-600 font-medium">Docket Complete</div>
                </div>
                <div className="py-2">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {contractStatus === 'Complete' ? '100' : contractStatus === 'Pending' ? '50' : '0'}%
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Contract Status</div>
                </div>
                <div className="hidden md:block py-2">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {workPermitStatus === 'Complete' ? '100' : workPermitStatus === 'Pending' ? '50' : '0'}%
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Work Permit</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                <p className="text-sm text-gray-600">10 sections to complete</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Contracts Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl group-hover:opacity-80 transition-colors ${
                  contractStatus.color === 'green' ? 'bg-green-100' :
                  contractStatus.color === 'orange' ? 'bg-orange-100' : 
                  contractStatus.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Briefcase className={`h-6 w-6 ${
                    contractStatus.color === 'green' ? 'text-green-600' :
                    contractStatus.color === 'orange' ? 'text-orange-600' : 
                    contractStatus.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                </div>
                <Badge variant="secondary" className={
                  contractStatus.color === 'green' ? 'bg-green-50 text-green-700' :
                  contractStatus.color === 'orange' ? 'bg-orange-50 text-orange-700' : 
                  contractStatus.color === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                }>
                  {contractStatus.color === 'green' ? 'Complete' : 
                   contractStatus.color === 'blue' ? 'Ready' : 'Action Needed'}
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