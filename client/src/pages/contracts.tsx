import { ContractManagement } from "@/components/contract-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Contracts() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="text-center flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Management</h1>
          <p className="text-gray-600">Download, sign, and upload your employment contracts and job offer letters</p>
        </div>
        <div className="ml-4">
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <ContractManagement />
    </div>
  );
}