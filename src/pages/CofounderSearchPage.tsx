import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CofounderFilters } from "@/components/CofounderFilters";
import { CofounderCard } from "@/components/CofounderCard";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface Founder {
  id: string;
  slug: string;
  founder_name: string;
  summary: string | null;
  profile_image_url: string | null;
  build_score: number;
  view_count: number;
  verified_founder: boolean;
  cofound_roles: string[] | null;
  cofound_stage: string | null;
  cofound_focus_area: string | null;
  cofound_location_pref: string | null;
}

const CofounderSearchPage = () => {
  const [roles, setRoles] = useState<string[]>([]);
  const [stage, setStage] = useState<string | null>(null);
  const [focusArea, setFocusArea] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(0);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search for focus area
  const debouncedSearch = useCallback((area: string) => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setPage(0); // Reset to first page on new search
    }, 300);
    setSearchTimeout(timeout);
  }, [searchTimeout]);

  useEffect(() => {
    debouncedSearch(focusArea);
  }, [focusArea, debouncedSearch]);

  // Fetch cofounders
  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ["cofounder-search", roles, stage, focusArea, location, page],
    queryFn: async () => {
      let query = supabase
        .from("founder_pages")
        .select(
          "id, slug, founder_name, summary, profile_image_url, build_score, view_count, verified_founder, cofound_roles, cofound_stage, cofound_focus_area, cofound_location_pref"
        )
        .eq("cofound_seeking", true)
        .order("build_score", { ascending: false });

      // Apply role filter (array overlap)
      if (roles.length > 0) {
        // Supabase array filter: overlap operator
        query = query.filter(
          "cofound_roles",
          "ov",
          `{${roles.map((r) => `"${r}"`).join(",")}}`
        );
      }

      // Apply stage filter
      if (stage) {
        query = query.eq("cofound_stage", stage);
      }

      // Apply focus area filter (case-insensitive contains)
      if (focusArea.trim()) {
        query = query.ilike("cofound_focus_area", `%${focusArea}%`);
      }

      // Apply location filter (case-insensitive contains)
      if (location.trim()) {
        query = query.ilike("cofound_location_pref", `%${location}%`);
      }

      // Pagination
      const RESULTS_PER_PAGE = 12;
      query = query.range(page * RESULTS_PER_PAGE, (page + 1) * RESULTS_PER_PAGE - 1);

      const { data, error } = await query;

      if (error) {
        console.error("[v0] Cofounder search error:", error);
        throw error;
      }

      return (data ?? []) as Founder[];
    },
  });

  const handleReset = () => {
    setRoles([]);
    setStage(null);
    setFocusArea("");
    setLocation("");
    setPage(0);
  };

  const hasFilters = roles.length > 0 || stage || focusArea.trim() || location.trim();

  return (
    <div className="buildpedia-container py-10">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            Find Your Next Cofounder
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover and connect with proven founders building in your space.
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters sidebar */}
          <div>
            <CofounderFilters
              roles={roles}
              stage={stage}
              focusArea={focusArea}
              location={location}
              onRolesChange={setRoles}
              onStageChange={setStage}
              onFocusAreaChange={setFocusArea}
              onLocationChange={setLocation}
              onReset={handleReset}
            />
          </div>

          {/* Results */}
          <div>
            {/* Results header */}
            {hasFilters && (
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {isFetching ? "Searching..." : `Found ${results?.length ?? 0} cofounder${(results?.length ?? 0) !== 1 ? "s" : ""}`}
                </p>
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* No results */}
            {!isLoading && (!results || results.length === 0) && hasFilters && (
              <div className="text-center py-16 border border-border rounded-lg bg-card">
                <h2 className="font-display text-xl text-foreground mb-2">
                  No cofounders found
                </h2>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or check back later.
                </p>
                <Button onClick={handleReset} variant="outline">
                  Reset Filters
                </Button>
              </div>
            )}

            {/* Empty state - no filters applied */}
            {!isLoading && (!results || results.length === 0) && !hasFilters && (
              <div className="text-center py-16 border border-border rounded-lg bg-card">
                <h2 className="font-display text-xl text-foreground mb-2">
                  Start Your Search
                </h2>
                <p className="text-muted-foreground mb-6">
                  Filter by roles, startup stage, and focus area to find your ideal cofounder.
                </p>
              </div>
            )}

            {/* Results grid */}
            {!isLoading && results && results.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {results.map((founder) => (
                    <CofounderCard
                      key={founder.id}
                      id={founder.id}
                      slug={founder.slug}
                      founderName={founder.founder_name}
                      summary={founder.summary}
                      profileImageUrl={founder.profile_image_url}
                      buildScore={founder.build_score}
                      viewCount={founder.view_count}
                      verifiedFounder={founder.verified_founder}
                      cofoundRoles={founder.cofound_roles}
                      cofoundStage={founder.cofound_stage}
                      cofoundFocusArea={founder.cofound_focus_area}
                      cofoundLocationPref={founder.cofound_location_pref}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    variant="outline"
                    disabled={page === 0 || isFetching}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1}
                  </span>
                  <Button
                    onClick={() => setPage(page + 1)}
                    variant="outline"
                    disabled={(results?.length ?? 0) < 12 || isFetching}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CofounderSearchPage;
