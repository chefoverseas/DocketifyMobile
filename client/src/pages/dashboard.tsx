import { useAuth } from "@/hooks/use-auth";
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
  AlertTriangle,
  ArrowRight,
  Upload,
  Download,
  Eye
} from "lucide-react";
import chefOverseasLogo from "@assets/Chef Overseas_22092021_final_A_1754986317927.png";

export default function Dashboard() {
  const { user } = useAuth();

  // Fetch user's docket data
  const { data: docketData } = useQuery({
    queryKey: ['/api/docket'],
    enabled: !!user,
  });

  // Fetch user's contract data
  const { data: contractData } = useQuery({
    queryKey: ['/api/contracts'],
    enabled: !!user,
  });

  // Fetch user's work permit data
  const { data: workPermitData } = useQuery({
    queryKey: ['/api/workpermit'],
    enabled: !!user,
  });

  const docket = docketData?.docket;
  const contract = contractData?.contract;
  const workPermit = workPermitData?.workPermit;

  // Calculate completion percentages
  const calculateDocketProgress = () => {
    if (!docket) return 0;
    const totalItems = 8; // passport, photos, references, etc.
    let completedItems = 0;
    
    if (docket.passportFrontUrl) completedItems++;
    if (docket.passportLastUrl) completedItems++;
    if (docket.passportVisaUrls && docket.passportVisaUrls.length > 0) completedItems++;
    if (docket.photoUrls && docket.photoUrls.length > 0) completedItems++;
    if (docket.references && docket.references.length > 0) completedItems++;
    if (docket.medicalReportUrls && docket.medicalReportUrls.length > 0) completedItems++;
    if (docket.educationCertUrls && docket.educationCertUrls.length > 0) completedItems++;
    if (docket.experienceUrls && docket.experienceUrls.length > 0) completedItems++;

    return Math.round((completedItems / totalItems) * 100);
  };

  const getContractStatus = () => {
    if (!contract) return "Not Started";
    if (contract.companyContractStatus === "signed" && contract.jobOfferStatus === "signed") return "Completed";
    if (contract.companyContractStatus === "pending" || contract.jobOfferStatus === "pending") return "In Progress";
    return "Pending";
  };

  const getWorkPermitStatus = () => {
    if (!workPermit) return "Not Started";
    switch (workPermit.status) {
      case "approved": return "Embassy Approved";
      case "applied": return "Applied";
      case "awaiting_decision": return "Awaiting Decision";
      case "preparation": return "In Preparation";
      case "rejected": return "Rejected";
      default: return "Not Started";
    }
  };

  const docketProgress = calculateDocketProgress();
  const contractStatus = getContractStatus();
  const workPermitStatus = getWorkPermitStatus();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img 
                src={chefOverseasLogo} 
                alt="Chef Overseas Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.displayName || user.phone}
                </h1>
                <p className="text-sm text-gray-600">
                  ID: {user.uid} • Chef Overseas Candidate Portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Docket Progress</p>
                  <p className="text-2xl font-bold text-green-600">{docketProgress}%</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <Progress value={docketProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Contract Status</p>
                  <p className="text-lg font-bold text-blue-600">{contractStatus}</p>
                </div>
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Work Permit</p>
                  <p className="text-lg font-bold text-orange-600">{workPermitStatus}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile</p>
                  <p className="text-lg font-bold text-purple-600">Complete</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Docket Management */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-green-600" />
                <span>Document Docket</span>
                <Badge variant="outline" className="ml-auto">
                  {docketProgress}% Complete
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Upload and manage your required documents including passport, photos, medical reports, and certificates.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Passport Documents</span>
                  <span className={docket?.passportFrontUrl ? "text-green-600" : "text-gray-400"}>
                    {docket?.passportFrontUrl ? "✓ Complete" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Professional Photos</span>
                  <span className={docket?.photoUrls?.length ? "text-green-600" : "text-gray-400"}>
                    {docket?.photoUrls?.length ? "✓ Complete" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>References</span>
                  <span className={docket?.references?.length ? "text-green-600" : "text-gray-400"}>
                    {docket?.references?.length ? "✓ Complete" : "Pending"}
                  </span>
                </div>
              </div>

              <Link href="/docket">
                <Button className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Manage Documents
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contracts */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-blue-600" />
                <span>Contracts</span>
                <Badge variant="outline" className="ml-auto">
                  {contractStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View and sign your employment contracts and job offer documents.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Company Contract</span>
                  <span className={contract?.companyContractStatus === "signed" ? "text-green-600" : "text-gray-400"}>
                    {contract?.companyContractStatus === "signed" ? "✓ Signed" : 
                     contract?.companyContractStatus === "pending" ? "⏳ Pending" : "Pending"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Job Offer Letter</span>
                  <span className={contract?.jobOfferStatus === "signed" ? "text-green-600" : "text-gray-400"}>
                    {contract?.jobOfferStatus === "signed" ? "✓ Signed" : 
                     contract?.jobOfferStatus === "pending" ? "⏳ Pending" : "Pending"}
                  </span>
                </div>
              </div>

              <Link href="/contracts">
                <Button className="w-full" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Contracts
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Work Permit */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-6 w-6 text-orange-600" />
                <span>Work Permit</span>
                <Badge variant="outline" className="ml-auto">
                  {workPermitStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Track your work permit application status and upload final documentation.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Application Status</span>
                  <span className={workPermit?.status === "approved" ? "text-green-600" : "text-orange-600"}>
                    {workPermitStatus}
                  </span>
                </div>
                {workPermit?.applicationDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Applied Date</span>
                    <span className="text-gray-600">
                      {new Date(workPermit.applicationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <Link href="/workpermit">
                <Button className="w-full" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Track Progress
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <User className="h-6 w-6 text-purple-600" />
                <span>Profile</span>
                <Badge variant="outline" className="ml-auto">
                  Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage your personal information and account settings.
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Name</span>
                  <span className="text-gray-600">{user.displayName || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Phone</span>
                  <span className="text-gray-600">{user.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Unique ID</span>
                  <span className="text-gray-600 font-mono">{user.uid}</span>
                </div>
              </div>

              <Link href="/profile">
                <Button className="w-full" variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {docket?.lastUpdated && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Docket updated on {new Date(docket.lastUpdated).toLocaleDateString()}</span>
                </div>
              )}
              {contract?.lastUpdated && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  <span>Contract updated on {new Date(contract.lastUpdated).toLocaleDateString()}</span>
                </div>
              )}
              {workPermit?.lastUpdated && (
                <div className="flex items-center space-x-3 text-sm">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <span>Work permit updated on {new Date(workPermit.lastUpdated).toLocaleDateString()}</span>
                </div>
              )}
              {!docket?.lastUpdated && !contract?.lastUpdated && !workPermit?.lastUpdated && (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}