import { ContractManagement } from "@/components/contract-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowLeft, FileSignature, Shield, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Contracts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Contract Management</h1>
                <p className="text-gray-600 mt-1">Secure document signing and submission process</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Secure Environment
            </Badge>
          </div>
        </div>

        {/* Security Information Banner */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Secure Document Processing</h3>
                <p className="text-blue-800 mb-4 leading-relaxed">
                  All documents are processed through our secure, encrypted system. Your personal information and signatures are protected with industry-standard security measures.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                    <FileSignature className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-blue-700 font-medium">Digital Signature Support</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-blue-700 font-medium">End-to-End Encryption</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <span className="text-blue-700 font-medium">Automatic Verification</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Contract Management Component */}
        <div className="space-y-6">
          <ContractManagement />
        </div>
      </div>
    </div>
  );
}