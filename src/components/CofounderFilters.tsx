import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

interface CofounderFiltersProps {
  roles: string[];
  stage: string | null;
  focusArea: string;
  location: string;
  onRolesChange: (roles: string[]) => void;
  onStageChange: (stage: string | null) => void;
  onFocusAreaChange: (area: string) => void;
  onLocationChange: (location: string) => void;
  onReset: () => void;
}

const AVAILABLE_ROLES = ["CTO", "CFO", "Product Lead", "Business Dev", "Designer", "Other"];
const STARTUP_STAGES = [
  { value: "early_stage", label: "Early stage" },
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
];

export const CofounderFilters = ({
  roles,
  stage,
  focusArea,
  location,
  onRolesChange,
  onStageChange,
  onFocusAreaChange,
  onLocationChange,
  onReset,
}: CofounderFiltersProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleRole = (role: string) => {
    if (roles.includes(role)) {
      onRolesChange(roles.filter((r) => r !== role));
    } else {
      onRolesChange([...roles, role]);
    }
  };

  const hasActiveFilters = roles.length > 0 || stage || focusArea || location;

  return (
    <div className="space-y-4">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden w-full flex items-center justify-between border border-border rounded-lg p-3 bg-card hover:bg-secondary transition-colors"
      >
        <span className="font-medium text-foreground">Filters</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Filter panel */}
      <div
        className={`space-y-5 ${
          mobileOpen ? "block" : "hidden"
        } lg:block lg:space-y-5 border border-border rounded-lg p-4 bg-card`}
      >
        {/* Roles */}
        <div>
          <Label className="text-sm font-medium mb-3 block text-foreground">
            Roles Needed
          </Label>
          <div className="space-y-2">
            {AVAILABLE_ROLES.map((role) => (
              <label
                key={role}
                className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded transition-colors"
              >
                <Checkbox
                  checked={roles.includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                />
                <span className="text-sm text-muted-foreground">{role}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stage */}
        <div>
          <Label htmlFor="stage" className="text-sm font-medium mb-3 block text-foreground">
            Startup Stage
          </Label>
          <Select value={stage || ""} onValueChange={(val) => onStageChange(val || null)}>
            <SelectTrigger id="stage">
              <SelectValue placeholder="All stages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All stages</SelectItem>
              {STARTUP_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Focus Area */}
        <div>
          <Label htmlFor="focus-area" className="text-sm font-medium mb-3 block text-foreground">
            Focus Area
          </Label>
          <Input
            id="focus-area"
            placeholder="e.g., AI, Climate Tech"
            value={focusArea}
            onChange={(e) => onFocusAreaChange(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Location */}
        <div>
          <Label htmlFor="location" className="text-sm font-medium mb-3 block text-foreground">
            Location
          </Label>
          <Input
            id="location"
            placeholder="e.g., Remote, NYC"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            onClick={onReset}
            variant="outline"
            className="w-full text-sm"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
};
