# Cofounder Discovery - Git Changes Summary

## Files Created (3 new components, 1 new page, 1 migration)

```
src/pages/CofounderSearchPage.tsx
├─ Main discovery page with search, filters, and results
├─ React Query integration for cofounder search
├─ Pagination support
└─ 235 lines

src/components/CofounderCard.tsx
├─ Reusable founder card component
├─ Displays profile info + cofounder requirements
├─ View Profile and Express Interest buttons
└─ 142 lines

src/components/CofounderFilters.tsx
├─ Filter controls for search
├─ Multi-select roles, stage dropdown, text inputs
├─ Debounced search for text fields
└─ 160 lines

supabase/migrations/20260503100000_add_cofounder_discovery.sql
├─ ALTER TABLE founder_pages with 6 new columns
├─ Create 2 performance indexes
└─ 15 lines
```

## Files Modified (6 existing files)

### 1. src/App.tsx
```diff
  import Index from "./pages/Index";
  import AuthPage from "./pages/AuthPage";
  import BuilderPage from "./pages/BuilderPage";
  import SearchPage from "./pages/SearchPage";
  import LeaderboardPage from "./pages/LeaderboardPage";
  import CreatePage from "./pages/CreatePage";
  import EditPage from "./pages/EditPage";
  import ProfilePage from "./pages/ProfilePage";
+ import CofounderSearchPage from "./pages/CofounderSearchPage";
  import DonationPage from "./pages/DonationPage";
  import NotFound from "./pages/NotFound";

  // ... in Routes JSX ...
  <Route path="/search" element={<SearchPage />} />
+ <Route path="/cofounder-search" element={<CofounderSearchPage />} />
  <Route path="/leaderboard" element={<LeaderboardPage />} />
```

### 2. src/pages/EditPage.tsx
```diff
  import { useState, useEffect } from "react";
  import { useParams, useNavigate } from "react-router-dom";
  import { supabase } from "@/integrations/supabase/client";
  import { useAuth } from "@/hooks/useAuth";
  import { useQuery } from "@tanstack/react-query";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";
+ import { Checkbox } from "@/components/ui/checkbox";
+ import {
+   Select,
+   SelectContent,
+   SelectItem,
+   SelectTrigger,
+   SelectValue,
+ } from "@/components/ui/select";
+ import { ChevronDown } from "lucide-react";

+ const AVAILABLE_ROLES = ["CTO", "CFO", "Product Lead", "Business Dev", "Designer", "Other"];
+ const STARTUP_STAGES = [
+   { value: "early_stage", label: "Early stage" },
+   { value: "pre_seed", label: "Pre-seed" },
+   { value: "seed", label: "Seed" },
+   { value: "series_a", label: "Series A" },
+ ];

  const EditPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [summary, setSummary] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
+   const [cofoundSeeking, setCofoundSeeking] = useState(false);
+   const [cofoundRoles, setCofoundRoles] = useState<string[]>([]);
+   const [cofoundStage, setCofoundStage] = useState("");
+   const [cofoundFocusArea, setCofoundFocusArea] = useState("");
+   const [cofoundLocationPref, setCofoundLocationPref] = useState("");
+   const [cofoundSectionOpen, setCofoundSectionOpen] = useState(false);

  // Load cofounder preferences on page load
  useEffect(() => {
    if (founder) {
      setSummary(founder.summary ?? "");
      setContent(founder.content ?? "");
+     setCofoundSeeking(founder.cofound_seeking ?? false);
+     setCofoundRoles(founder.cofound_roles ?? []);
+     setCofoundStage(founder.cofound_stage ?? "");
+     setCofoundFocusArea(founder.cofound_focus_area ?? "");
+     setCofoundLocationPref(founder.cofound_location_pref ?? "");
    }
  }, [founder]);

+ const toggleCofoundRole = (role: string) => {
+   if (cofoundRoles.includes(role)) {
+     setCofoundRoles(cofoundRoles.filter((r) => r !== role));
+   } else {
+     setCofoundRoles([...cofoundRoles, role]);
+   }
+ };

  // Update save handler with cofounder fields
  const handleSave = async () => {
    if (!founder) return;
    if (content.length < 50) { toast.error("Content must be at least 50 characters"); return; }
    setSaving(true);

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
+       cofound_seeking: cofoundSeeking,
+       cofound_roles: cofoundRoles.length > 0 ? cofoundRoles : null,
+       cofound_stage: cofoundStage || null,
+       cofound_focus_area: cofoundFocusArea.trim() || null,
+       cofound_location_pref: cofoundLocationPref.trim() || null,
+       cofound_updated_at: cofoundSeeking ? new Date().toISOString() : null,
      })
      .eq("id", founder.id);

    if (error) { toast.error(error.message); setSaving(false); return; }
    toast.success("Page updated");
    navigate(`/${slug}`);
  };

  // JSX: Add collapsible cofounder section with form controls
  // [+94 lines of JSX for the cofounder preferences form]
```

### 3. src/pages/BuilderPage.tsx
```diff
  import { useParams, useNavigate } from "react-router-dom";
  import { useQuery } from "@tanstack/react-query";
  import { supabase } from "@/integrations/supabase/client";
  import { useAuth } from "@/hooks/useAuth";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
- import { Edit, ShieldCheck, Eye, Rocket, Flag, Calendar, Settings } from "lucide-react";
+ import { Edit, ShieldCheck, Eye, Rocket, Flag, Calendar, Settings, Heart } from "lucide-react";
  import { toast } from "sonner";

  import BuilderManageSection from "@/components/builder/BuilderManageSection";
  import ReactMarkdown from "react-markdown";

+ const STAGE_LABELS: { [key: string]: string } = {
+   early_stage: "Early stage",
+   pre_seed: "Pre-seed",
+   seed: "Seed",
+   series_a: "Series A",
+ };

  const BuilderPage = () => {
    // ... existing code ...

    // In sidebar JSX: Add conditional cofounder info card
    // [+44 lines of JSX showing cofounder preferences if cofound_seeking = true]
```

### 4. src/pages/ProfilePage.tsx
```diff
  import { useState } from "react";
  import { useNavigate } from "react-router-dom";
  import { useQuery, useQueryClient } from "@tanstack/react-query";
  import { supabase } from "@/integrations/supabase/client";
  import { useAuth } from "@/hooks/useAuth";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
+ import { Badge } from "@/components/ui/badge";
  import { toast } from "sonner";
- import { User, Edit } from "lucide-react";
+ import { User, Edit, Heart } from "lucide-react";

+ const STAGE_LABELS: { [key: string]: string } = {
+   early_stage: "Early stage",
+   pre_seed: "Pre-seed",
+   seed: "Seed",
+   series_a: "Series A",
+ };

  const ProfilePage = () => {
    // ... existing code ...

    // In JSX: Add "Cofounder Preferences" section
    // [+37 lines of JSX with cofounder preference management links]
```

### 5. src/components/SiteHeader.tsx
```diff
- import { Search, Plus, Trophy, LogIn, LogOut, User, Heart } from "lucide-react";
+ import { Search, Plus, Trophy, LogIn, LogOut, User, Heart, Users } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { supabase } from "@/integrations/supabase/client";
  import { useAuth } from "@/hooks/useAuth";

  // In nav JSX: Add Cofounders link
  <Button variant="ghost" size="sm" onClick={() => navigate("/search")} className="gap-1.5 text-muted-foreground">
    <Search className="h-4 w-4" /> Search
  </Button>
+ <Button variant="ghost" size="sm" onClick={() => navigate("/cofounder-search")} className="gap-1.5 text-muted-foreground">
+   <Users className="h-4 w-4" /> Cofounders
+ </Button>
  <Button variant="ghost" size="sm" onClick={() => navigate("/leaderboard")} className="gap-1.5 text-muted-foreground">
    <Trophy className="h-4 w-4" /> Leaderboard
  </Button>
```

### 6. src/integrations/supabase/types.ts
```diff
  export type Database = {
    public: {
      Tables: {
        founder_pages: {
          Row: {
            build_score: number
            content: string | null
            created_at: string
            created_by: string | null
            founder_name: string
            id: string
            profile_image_url: string | null
            slug: string
            summary: string | null
            updated_at: string
            verified_founder: boolean
            view_count: number
+           cofound_seeking: boolean
+           cofound_roles: string[] | null
+           cofound_stage: string | null
+           cofound_focus_area: string | null
+           cofound_location_pref: string | null
+           cofound_updated_at: string | null
          }
          Insert: {
            build_score?: number
            content?: string | null
            created_at?: string
            created_by?: string | null
            founder_name: string
            id?: string
            profile_image_url?: string | null
            slug: string
            summary?: string | null
            updated_at?: string
            verified_founder?: boolean
            view_count?: number
+           cofound_seeking?: boolean
+           cofound_roles?: string[] | null
+           cofound_stage?: string | null
+           cofound_focus_area?: string | null
+           cofound_location_pref?: string | null
+           cofound_updated_at?: string | null
          }
          Update: {
            build_score?: number
            content?: string | null
            created_at?: string
            created_by?: string | null
            founder_name?: string
            id?: string
            profile_image_url?: string | null
            slug?: string
            summary?: string | null
            updated_at?: string
            verified_founder?: boolean
            view_count?: number
+           cofound_seeking?: boolean
+           cofound_roles?: string[] | null
+           cofound_stage?: string | null
+           cofound_focus_area?: string | null
+           cofound_location_pref?: string | null
+           cofound_updated_at?: string | null
          }
          Relationships: []
        }
```

---

## Statistics

### Code Changes
- **Files Created**: 4
- **Files Modified**: 6
- **Total New Lines**: ~1,000
- **New Components**: 3
- **New Pages**: 1
- **Database Columns Added**: 6
- **Indexes Added**: 2

### Breaking Changes
- **None** - All changes are additive and backward compatible

### Dependencies Added
- **None** - Uses existing tech stack (React, React Query, Supabase, Tailwind, Radix UI, lucide-react)

### Build Status
✅ Builds successfully
✅ TypeScript passes
✅ No linting errors
✅ Dev server running (port 8081)

---

## Deployment Checklist

- [ ] Review all code changes above
- [ ] Test locally: `npm run dev`
- [ ] Test all new features in browser
- [ ] Run migration: `supabase db push`
- [ ] Verify database schema updated
- [ ] Test cofounder search page
- [ ] Test edit page cofounder form
- [ ] Test profile display
- [ ] Mobile responsive testing
- [ ] Create PR for review (or commit directly to main as per instructions)
- [ ] Deploy to production

---

## Rollback Instructions

If needed to revert this feature:

### Remove Code
1. Remove import and route from `src/App.tsx`
2. Remove cofounder sections from `EditPage.tsx`, `BuilderPage.tsx`, `ProfilePage.tsx`
3. Remove nav link from `SiteHeader.tsx`
4. Delete `/src/pages/CofounderSearchPage.tsx`
5. Delete `/src/components/CofounderCard.tsx`
6. Delete `/src/components/CofounderFilters.tsx`
7. Revert types in `src/integrations/supabase/types.ts`

### Remove Database Changes
```bash
supabase migration down
# or manually run:
ALTER TABLE public.founder_pages DROP COLUMN cofound_seeking;
ALTER TABLE public.founder_pages DROP COLUMN cofound_roles;
ALTER TABLE public.founder_pages DROP COLUMN cofound_stage;
ALTER TABLE public.founder_pages DROP COLUMN cofound_focus_area;
ALTER TABLE public.founder_pages DROP COLUMN cofound_location_pref;
ALTER TABLE public.founder_pages DROP COLUMN cofound_updated_at;
DROP INDEX idx_founder_pages_cofound_seeking;
DROP INDEX idx_founder_pages_cofound_stage;
```

---

**Ready for deployment!** ✅
