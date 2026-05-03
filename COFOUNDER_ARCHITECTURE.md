# Cofounder Discovery - Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Buildpedia Frontend                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼──┐  ┌───▼────┐  ┌──▼────────┐
            │  Edit    │  │Builder │  │ Cofounder │
            │  Page    │  │ Page   │  │ Search    │
            │          │  │        │  │ Page      │
            └───────┬──┘  └───┬────┘  └──┬────────┘
                    │         │         │
                    └─────────┼─────────┘
                              │
                   ┌──────────▼──────────┐
                   │  React Query Cache  │
                   │  (cofounder-search) │
                   └──────────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │  Supabase Client    │
                   │  (founder_pages)    │
                   └──────────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │  Supabase Database  │
                   │  (PostgreSQL)       │
                   └─────────────────────┘
```

---

## Data Model

```typescript
// founder_pages table extensions
{
  // Existing fields
  id: string
  slug: string
  founder_name: string
  summary: string | null
  profile_image_url: string | null
  content: string | null
  build_score: number
  view_count: number
  verified_founder: boolean
  created_at: string
  updated_at: string
  created_by: string | null

  // NEW: Cofounder Discovery Fields
  cofound_seeking: boolean              // Toggle: is this founder looking?
  cofound_roles: string[]               // ["CTO", "CFO", "Product Lead", ...]
  cofound_stage: string                 // "seed" | "series_a" | "pre_seed" | "early_stage"
  cofound_focus_area: string            // "AI, Climate Tech, FinTech"
  cofound_location_pref: string         // "Remote, NYC, SF"
  cofound_updated_at: timestamptz       // When prefs were last updated
}
```

---

## Feature: Cofounder Search Page

### Component Hierarchy
```
CofounderSearchPage
├── CofounderFilters
│   ├── Role Multi-Select (Checkbox Group)
│   ├── Stage Dropdown
│   ├── Focus Area Input (with debounce)
│   ├── Location Input (with debounce)
│   └── Clear All Button
│
├── Results Grid
│   ├── Loading State (Spinner)
│   ├── Empty State (No results message)
│   └── CofounderCard[] (paginated)
│       ├── Profile Image + Name
│       ├── Verification Badge
│       ├── Summary
│       ├── Build Score & View Count
│       ├── Cofounder Requirements Display
│       │   ├── Roles (Badges)
│       │   ├── Stage
│       │   ├── Focus Area
│       │   └── Location
│       └── Action Buttons
│           ├── View Profile
│           └── Express Interest
│
└── Pagination
    ├── Previous Button
    ├── Page Info
    └── Next Button
```

### Filter Logic Flow
```
User Types/Selects Filters
    │
    ├─ Roles → Multi-select array build
    ├─ Stage → Single select value
    ├─ Focus Area → Debounce(300ms) on text input
    └─ Location → Debounce(300ms) on text input
    │
    ▼
React Query Key Updates
    queryKey = ["cofounder-search", roles, stage, focusArea, location, page]
    │
    ▼
Supabase Query Executes (if cache miss)
    ```sql
    SELECT *
    FROM founder_pages
    WHERE cofound_seeking = true
      AND (roles_filter OR stage_filter OR focus_filter OR location_filter)
    ORDER BY build_score DESC
    LIMIT 20 OFFSET page*20
    ```
    │
    ▼
Results Rendered
    CofounderCard components display with matched founder data
```

---

## Feature: Edit Cofounder Preferences

### Edit Page Enhancement
```
EditPage
│
├── Summary Input
├── Content Editor (Markdown)
│
└── NEW: Cofounder Section (Collapsible)
    │
    ├── Toggle: "I'm looking for cofounders"
    │   (Shows/hides the form below)
    │
    └── Cofounder Preferences Form
        ├── Roles Multi-Select
        │   ├── CTO
        │   ├── CFO
        │   ├── Product Lead
        │   ├── Business Dev
        │   ├── Designer
        │   └── Other
        │
        ├── Startup Stage Dropdown
        │   ├── Early stage
        │   ├── Pre-seed
        │   ├── Seed
        │   └── Series A
        │
        ├── Focus Area Input
        │   └── Free text (e.g., "AI, Climate Tech")
        │
        └── Location Preference Input
            └── Free text (e.g., "Remote, NYC, SF")

On Save:
  founder_pages UPDATE
  ├── cofound_seeking = checkbox state
  ├── cofound_roles = selected roles array
  ├── cofound_stage = dropdown value
  ├── cofound_focus_area = trimmed input
  ├── cofound_location_pref = trimmed input
  └── cofound_updated_at = NOW()
```

---

## Feature: Profile Display (BuilderPage)

### Sidebar Enhancement
```
BuilderPage Sidebar
│
├── Profile Image & Name
├── Verification Badge
│
├── Quick Facts Card
│   ├── Build Score
│   ├── Global Rank
│   ├── Page Views
│   ├── Milestones Count
│   └── Products Count
│
└── NEW: Looking for Cofounders Card (conditional)
    └── IF cofound_seeking = true
        │
        ├── Heart Icon + Title
        ├── Seeking: [Role Badges]
        ├── Stage: [Stage Label]
        ├── Focus: [Focus Area Text]
        ├── Location: [Location Pref Text]
        └── Express Interest Button
```

---

## Database Performance

### Query Optimization
```sql
-- Indexes created for cofounder search performance

CREATE INDEX idx_founder_pages_cofound_seeking 
ON public.founder_pages(cofound_seeking);
-- Fast filtering: WHERE cofound_seeking = true

CREATE INDEX idx_founder_pages_cofound_stage 
ON public.founder_pages(cofound_stage);
-- Fast stage-based searches

-- Query execution (with indexes)
SELECT * FROM founder_pages
WHERE cofound_seeking = true           -- Uses idx_founder_pages_cofound_seeking
  AND cofound_stage = 'seed'           -- Uses idx_founder_pages_cofound_stage
ORDER BY build_score DESC
LIMIT 20;
```

### Expected Performance
- **Founders seeking cofounders**: ~5-10% of all founder pages (with growth)
- **Indexed query execution**: <10ms for typical filters
- **Result set size**: 20 results per page (pagination handles scale)
- **React Query cache**: Results cached per filter combination

---

## State Management

### Local Component State
```typescript
// CofounderSearchPage.tsx
const [roles, setRoles] = useState<string[]>([]);        // Multi-select
const [stage, setStage] = useState<string | null>(null); // Single select
const [focusArea, setFocusArea] = useState("");          // Text input
const [location, setLocation] = useState("");            // Text input
const [page, setPage] = useState(0);                     // Pagination

// Server State (React Query)
const { data: results, isLoading, isFetching } = useQuery({
  queryKey: ["cofounder-search", roles, stage, focusArea, location, page],
  queryFn: async () => { /* Supabase fetch */ }
});
```

### Why React Query?
- Automatic caching per filter combination
- Automatic refetch on queryKey change
- Built-in loading/error states
- No Redux boilerplate needed

---

## UI Components Used

### New Components
```
CofounderSearchPage       [src/pages/CofounderSearchPage.tsx]
├── CofounderFilters     [src/components/CofounderFilters.tsx]
└── CofounderCard        [src/components/CofounderCard.tsx]
```

### Existing UI Library (shadcn/ui)
```
Button             - Action buttons (View Profile, Express Interest)
Input              - Text filters (Focus Area, Location)
Select             - Stage dropdown
Checkbox           - Role multi-select & seeking toggle
Badge              - Role & stage display
Textarea           - Existing in EditPage
Label              - Form labels
Loader             - Loading state spinner
```

### Existing Icons (lucide-react)
```
Users              - Cofounders nav link
Heart              - Looking for cofounders card
ChevronDown        - Collapsible sections
Search, Trophy, Rocket, etc. - Existing nav/stats
```

---

## State Flow Diagram: Cofounder Discovery

```
┌─────────────────────────────────────────────────────────┐
│  Founder Sets Cofounder Preferences                     │
│  (EditPage → Toggle + Form Fill → Save)                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ UPDATE founder_pages
                   │   SET cofound_seeking = true
                   │       cofound_roles = ['CTO', 'CFO']
                   │       cofound_stage = 'seed'
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Database (PostgreSQL)                         │
│  founder_pages.cofound_* fields updated                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ (Triggered by page refresh or
                   │  founder clicking "View Profile")
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  BuilderPage Loads                                      │
│  SELECT founder_pages WHERE slug = 'john-doe'           │
│  Sidebar displays cofound_seeking card with prefs       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Other Users Browse Cofounder Search                    │
│  (CofounderSearchPage → Set Filters)                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ FILTER & ORDER
                   │   WHERE cofound_seeking = true
                   │   AND cofound_roles @> ['CTO']
                   │   AND cofound_stage = 'seed'
                   │   ORDER BY build_score DESC
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Results Display (CofounderCard)                        │
│  Shows founder profile + cofounder requirements         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ├─ View Profile → BuilderPage
                   │
                   └─ Express Interest → (Future: Notification)
```

---

## Migration Strategy

### Pre-deployment
1. Create migration file: `20260503100000_add_cofounder_discovery.sql`
2. Review schema changes in Supabase dashboard
3. Test locally via `supabase db push`

### Deployment
1. Deploy code to production
2. Run migration in Supabase: `supabase db push`
3. Verify new columns exist: `SELECT * FROM founder_pages LIMIT 1`
4. All existing founder pages automatically get `cofound_seeking = false`
5. Feature is dormant until founders enable it

### Rollback
If needed, simple ALTER TABLE to drop columns:
```sql
ALTER TABLE public.founder_pages
DROP COLUMN cofound_seeking,
DROP COLUMN cofound_roles,
DROP COLUMN cofound_stage,
DROP COLUMN cofound_focus_area,
DROP COLUMN cofound_location_pref,
DROP COLUMN cofound_updated_at;

DROP INDEX idx_founder_pages_cofound_seeking;
DROP INDEX idx_founder_pages_cofound_stage;
```

---

## Security Model

### Row Level Security (RLS)
- Existing `founder_pages` RLS policies already support this:
  - **SELECT**: Public (anyone can view founder data)
  - **INSERT**: Authenticated users can create pages
  - **UPDATE**: Only page creator can update
  - **DELETE**: Only page creator can delete

### No new RLS needed
- Cofounder fields are just additional columns on `founder_pages`
- Existing RLS policies automatically apply

### Data Privacy
- Cofounder preferences are visible to all (intentional for discoverability)
- Only the page creator can edit their own preferences
- No sensitive data stored (roles, stage, focus area are business-intent, not PII)

---

**Architecture Status**: ✅ Simple, performant, and secure. Ready for production.
