import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WorkPermitStatus = "preparation" | "applied" | "awaiting_decision" | "approved" | "rejected";

interface StatusDropdownProps {
  value: WorkPermitStatus;
  onValueChange: (value: WorkPermitStatus) => void;
  disabled?: boolean;
}

const statusOptions = [
  { value: "preparation" as const, label: "Preparation" },
  { value: "applied" as const, label: "Applied" },
  { value: "awaiting_decision" as const, label: "Awaiting Embassy Decision" },
  { value: "approved" as const, label: "Approved" },
  { value: "rejected" as const, label: "Rejected" },
];

export function StatusDropdown({ value, onValueChange, disabled = false }: StatusDropdownProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}