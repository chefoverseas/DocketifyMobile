import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  User,
  FileText,
  Download,
  Eye,
  Calendar,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  MapPin,
  Users,
  GraduationCap,
  Briefcase,
  FileImage,
  File
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";

interface AdminDocketDetailProps {
  userId: string;
}

interface FileData {
  name: string;
  url: string;
  size: number;
}

interface Reference {
  fullName: string;
  company: string;
  designation: string;
  phone: string;
  email: string;
}

export default function AdminDocketDetail({ userId }: AdminDocketDetailProps) {
  const [, setLocation] = useLocation();

  // Check admin authentication
  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ["/api/admin/me"],
  });

  const { data: userDocketData, isLoading: docketLoading } = useQuery({
    queryKey: [`/api/admin/docket/${userId}`],
    enabled: !!(adminData as any)?.admin && !!userId,
  });

  if (adminLoading || docketLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading docket details...</p>
        </div>
      </div>
    );
  }

  if (!(adminData as any)?.admin) {
    setLocation("/admin/login");
    return null;
  }

  const userData = (userDocketData as any)?.user;
  const docket = (userDocketData as any)?.docket;

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Link href="/admin/dockets">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dockets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const calculateProgress = () => {
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

  const progress = calculateProgress();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FilePreview = ({ file, label }: { file: string | null; label: string }) => {
    if (!file) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{label} not uploaded</p>
        </div>
      );
    }

    const isImage = file.match(/\.(jpg|jpeg|png|gif)$/i);
    
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {isImage ? (
              <FileImage className="h-5 w-5 text-blue-600" />
            ) : (
              <File className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-900">{label}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => window.open(file, '_blank')}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
        {isImage && (
          <div className="mt-2">
            <img src={file} alt={label} className="max-w-full h-32 object-cover rounded border" />
          </div>
        )}
      </div>
    );
  };

  const FilesGrid = ({ files, label }: { files: FileData[]; label: string }) => {
    if (!files || files.length === 0) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <XCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No {label.toLowerCase()} uploaded</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {files.map((file, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => window.open(file.url, '_blank')}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/dockets">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dockets
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {userData.displayName}'s Docket
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Document collection and details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-lg font-semibold text-gray-900">{userData.displayName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">User ID</p>
                <p className="text-lg font-semibold text-gray-900">{userData.uid}</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{userData.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{userData.phone}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Docket Progress</h3>
                <Badge 
                  className={`
                    ${progress.percentage === 100 ? 'bg-green-100 text-green-800 border-green-200' : 
                      progress.percentage > 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      progress.percentage > 0 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'}
                  `}
                >
                  {progress.percentage === 100 ? <CheckCircle className="h-3 w-3 mr-1" /> :
                   progress.percentage > 0 ? <Clock className="h-3 w-3 mr-1" /> :
                   <XCircle className="h-3 w-3 mr-1" />}
                  {progress.completed}/{progress.total} Complete ({Math.round(progress.percentage)}%)
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              {docket?.lastUpdated && (
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last updated: {format(new Date(docket.lastUpdated), 'PPpp')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Passport Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileImage className="h-5 w-5 mr-2" />
                Passport Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilePreview file={docket?.passportFrontUrl} label="Passport Front Page" />
              <FilePreview file={docket?.passportLastUrl} label="Passport Last Page" />
              <FilePreview file={docket?.passportPhotoUrl} label="Passport Photo" />
            </CardContent>
          </Card>

          {/* Personal Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Personal Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilePreview file={docket?.resumeUrl} label="Resume/CV" />
              <FilePreview file={docket?.offerLetterUrl} label="Offer Letter" />
            </CardContent>
          </Card>

          {/* Address Proofs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Proofs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FilePreview file={docket?.permanentAddressUrl} label="Permanent Address Proof" />
              <FilePreview file={docket?.currentAddressUrl} label="Current Address Proof" />
            </CardContent>
          </Card>

          {/* Education Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilesGrid files={docket?.educationFiles || []} label="Education Files" />
            </CardContent>
          </Card>

          {/* Experience Files */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Experience Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilesGrid files={docket?.experienceFiles || []} label="Experience Files" />
            </CardContent>
          </Card>

          {/* Other Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <File className="h-5 w-5 mr-2" />
                Other Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilesGrid files={docket?.otherCertifications || []} label="Other Certifications" />
            </CardContent>
          </Card>
        </div>

        {/* References */}
        {docket?.references && docket.references.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Professional References ({docket.references.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(docket.references as Reference[]).map((reference, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{reference.fullName}</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Building className="h-3 w-3 mr-2" />
                            <span>{reference.designation} at {reference.company}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-2" />
                            <span>{reference.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-2" />
                            <span>{reference.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}