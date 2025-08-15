import { ContractManagement } from "@/components/contract-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Contracts() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contract Management</h1>
        <p className="text-gray-600">Download, sign, and upload your employment contracts and job offer letters</p>
      </div>

      <ContractManagement />
    </div>
  );
}