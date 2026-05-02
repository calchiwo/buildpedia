import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

const AVAILABLE_ROLES = ["CTO", "CFO", "Product Lead", "Business Dev", "Designer", "Other"];
const STARTUP_STAGES = [
  { value: "early_stage", label: "Early stage" },
  { value: "pre_seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
];

const EditPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [cofoundSeeking, setCofoundSeeking] = useState(false);
  const [cofoundRoles, setCofoundRoles] = useState<string[]>([]);
  const [cofoundStage, setCofoundStage] = useState("");
  const [cofoundFocusArea, setCofoundFocusArea] = useState("");
  const [cofoundLocationPref, setCofoundLocationPref] = useState("");
  const [cofoundSectionOpen, setCofoundSectionOpen] = useState(false);

  const { data: founder } = useQuery({
    queryKey: ["founder-edit", slug],
    queryFn: async () => {
      const { data } = await supabase.from("founder_pages").select("*").eq("slug", slug).maybeSingle();
      return data;
    },
    enabled: !!slug,
  });

  useEffect(() => {
    if (founder) {
      setSummary(founder.summary ?? "");
      setContent(founder.content ?? "");
      setCofoundSeeking(founder.cofound_seeking ?? false);
      setCofoundRoles(founder.cofound_roles ?? []);
      setCofoundStage(founder.cofound_stage ?? "");
      setCofoundFocusArea(founder.cofound_focus_area ?? "");
      setCofoundLocationPref(founder.cofound_location_pref ?? "");
    }
  }, [founder]);

  if (!user) { navigate("/auth"); return null; }

  const toggleCofoundRole = (role: string) => {
    if (cofoundRoles.includes(role)) {
      setCofoundRoles(cofoundRoles.filter((r) => r !== role));
    } else {
      setCofoundRoles([...cofoundRoles, role]);
    }
  };

  const handleSave = async () => {
    if (!founder) return;
    if (content.length < 50) { toast.error("Content must be at least 50 characters"); return; }
    setSaving(true);

    // Save revision
    await supabase.from("page_revisions").insert({
      page_id: founder.id,
      edited_by: user.id,
      previous_content: founder.content ?? "",
      new_content: content.trim(),
    });

    const { error } = await supabase
      .from("founder_pages")
      .update({
        summary: summary.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString(),
        cofound_seeking: cofoundSeeking,
        cofound_roles: cofoundRoles.length > 0 ? cofoundRoles : null,
        cofound_stage: cofoundStage || null,
        cofound_focus_area: cofoundFocusArea.trim() || null,
        cofound_location_pref: cofoundLocationPref.trim() || null,
        cofound_updated_at: cofoundSeeking ? new Date().toISOString() : null,
      })
      .eq("id", founder.id);

    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Page updated");
    navigate(`/${slug}`);
  };

  if (!founder) return <div className="buildpedia-container py-20 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="buildpedia-container py-10 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl text-foreground mb-6">Edit: {founder.founder_name}</h1>
      <div className="space-y-5">
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="content">Content (Markdown)</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={16} />
        </div>

        {/* Cofounder Discovery Section */}
        <div className="border border-border rounded-lg p-4 bg-card">
          <button
            onClick={() => setCofoundSectionOpen(!cofoundSectionOpen)}
            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
          >
            <h2 className="font-display text-lg text-foreground">Open to Cofounding?</h2>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${cofoundSectionOpen ? "rotate-180" : ""}`}
            />
          </button>

          {cofoundSectionOpen && (
            <div className="mt-4 space-y-4 pt-4 border-t border-border/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={cofoundSeeking}
                  onCheckedChange={(checked) => setCofoundSeeking(checked === true)}
                />
                <span className="text-sm text-foreground">I&apos;m looking for cofounders</span>
              </label>

              {cofoundSeeking && (
                <>
                  {/* Roles */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Roles I Need</Label>
                    <div className="space-y-2">
                      {AVAILABLE_ROLES.map((role) => (
                        <label
                          key={role}
                          className="flex items-center gap-2 cursor-pointer hover:bg-secondary/30 p-2 rounded"
                        >
                          <Checkbox
                            checked={cofoundRoles.includes(role)}
                            onCheckedChange={() => toggleCofoundRole(role)}
                          />
                          <span className="text-sm text-muted-foreground">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Stage */}
                  <div>
                    <Label htmlFor="cofound-stage" className="text-sm font-medium mb-2 block">
                      Startup Stage
                    </Label>
                    <Select value={cofoundStage} onValueChange={setCofoundStage}>
                      <SelectTrigger id="cofound-stage">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Label htmlFor="cofound-focus" className="text-sm font-medium mb-2 block">
                      Focus Area
                    </Label>
                    <Input
                      id="cofound-focus"
                      placeholder="e.g., AI, Climate Tech, FinTech"
                      value={cofoundFocusArea}
                      onChange={(e) => setCofoundFocusArea(e.target.value)}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label htmlFor="cofound-location" className="text-sm font-medium mb-2 block">
                      Location Preference
                    </Label>
                    <Input
                      id="cofound-location"
                      placeholder="e.g., Remote, NYC, SF"
                      value={cofoundLocationPref}
                      onChange={(e) => setCofoundLocationPref(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
          <Button variant="outline" onClick={() => navigate(`/${slug}`)}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};

export default EditPage;
