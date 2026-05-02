import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Eye, Rocket } from "lucide-react";

interface CofounderCardProps {
  id: string;
  slug: string;
  founderName: string;
  summary: string | null;
  profileImageUrl: string | null;
  buildScore: number;
  viewCount: number;
  verifiedFounder: boolean;
  cofoundRoles: string[] | null;
  cofoundStage: string | null;
  cofoundFocusArea: string | null;
  cofoundLocationPref: string | null;
}

const STAGE_LABELS: { [key: string]: string } = {
  early_stage: "Early stage",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
};

export const CofounderCard = ({
  slug,
  founderName,
  summary,
  profileImageUrl,
  buildScore,
  viewCount,
  verifiedFounder,
  cofoundRoles,
  cofoundStage,
  cofoundFocusArea,
  cofoundLocationPref,
}: CofounderCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="border border-border rounded-lg p-5 bg-card hover:border-accent/40 transition-colors h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center text-foreground font-display text-lg shrink-0 overflow-hidden">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={founderName}
              className="h-full w-full object-cover"
            />
          ) : (
            founderName.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap gap-y-1">
            <h3 className="font-display text-base text-foreground truncate">
              {founderName}
            </h3>
            {verifiedFounder && (
              <ShieldCheck className="h-3.5 w-3.5 text-accent flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {summary || "No summary"}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Rocket className="h-3 w-3" />
          <span>{buildScore} pts</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{(viewCount ?? 0).toLocaleString()} views</span>
        </div>
      </div>

      {/* Seeking info */}
      {cofoundRoles && cofoundRoles.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-foreground mb-2">Seeking:</p>
          <div className="flex flex-wrap gap-1.5">
            {cofoundRoles.map((role) => (
              <Badge
                key={role}
                variant="secondary"
                className="text-xs py-0.5 px-2"
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Stage, Focus Area, Location */}
      <div className="space-y-1 mb-4 text-xs text-muted-foreground flex-1">
        {cofoundStage && (
          <div>
            <span className="font-medium text-foreground">Stage:</span>{" "}
            {STAGE_LABELS[cofoundStage] || cofoundStage}
          </div>
        )}
        {cofoundFocusArea && (
          <div>
            <span className="font-medium text-foreground">Focus:</span>{" "}
            {cofoundFocusArea}
          </div>
        )}
        {cofoundLocationPref && (
          <div>
            <span className="font-medium text-foreground">Location:</span>{" "}
            {cofoundLocationPref}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-3 border-t border-border/50">
        <Button
          onClick={() => navigate(`/${slug}`)}
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
        >
          View Profile
        </Button>
        <Button size="sm" className="flex-1 text-xs">
          Express Interest
        </Button>
      </div>
    </div>
  );
};
