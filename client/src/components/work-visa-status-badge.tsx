import { Badge } from "@/components/ui/badge";

export type WorkVisaStatus = "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected" | "interview_scheduled";

interface WorkVisaStatusBadgeProps {
  status: WorkVisaStatus;
  className?: string;
}

const statusConfig = {
  preparation: {
    label: "Preparation",
    variant: "secondary" as const,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  },
  applied: {
    label: "Applied",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  awaiting_decision: {
    label: "Awaiting Embassy Decision",
    variant: "default" as const,
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    variant: "default" as const,
    className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  },
  approved: {
    label: "Embassy Approved",
    variant: "default" as const,
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
};

export function WorkVisaStatusBadge({ status, className }: WorkVisaStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.preparation;
  
  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ""}`}
    >
      {config.label}
    </Badge>
  );
}