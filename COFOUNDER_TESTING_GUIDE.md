# Cofounder Discovery - Testing Guide

## Pre-Testing Setup

### 1. Database Migration
```bash
# Apply the schema changes
cd /vercel/share/v0-project
supabase db push

# Verify columns exist
supabase db inspect founder_pages
# Should show:
# - cofound_seeking (boolean)
# - cofound_roles (text[])
# - cofound_stage (text)
# - cofound_focus_area (text)
# - cofound_location_pref (text)
# - cofound_updated_at (timestamptz)
```

### 2. Start Dev Server
```bash
cd /vercel/share/v0-project
npm run dev
# Dev server should be running on http://localhost:8081
```

### 3. Log In
- Navigate to http://localhost:8081/auth
- Create a test account or log in with existing credentials
- Note: You need a Supabase account with founder pages

---

## Test Scenario 1: Create Cofounder Preferences

### Setup
1. Go to http://localhost:8081/profile
2. Click on one of your "My Builder Pages" or create a new one
3. Click the pencil icon or "Edit" button

### Test Steps
1. ✅ Page should load with "Edit: [Founder Name]" heading
2. ✅ Scroll to bottom - find collapsible "Open to Cofounding?" section
3. ✅ Click to expand the section
4. ✅ Toggle "I'm looking for cofounders" checkbox
5. ✅ Form should appear with:
   - [ ] "Roles I Need" with checkboxes (CTO, CFO, Product Lead, etc.)
   - [ ] "Startup Stage" dropdown
   - [ ] "Focus Area" text input
   - [ ] "Location Preference" text input

### Test Actions
```
1. Toggle "I'm looking for cofounders" ON
   - Form controls should appear

2. Select roles (multi-select test)
   - Click CTO → should check
   - Click CFO → both should be checked
   - Click CTO again → CTO should uncheck, CFO checked
   - Verify multiple selections work

3. Select stage
   - Click dropdown → should show:
     - Early stage
     - Pre-seed
     - Seed
     - Series A
   - Select "Seed" → should display selected

4. Fill focus area
   - Type: "AI, Climate Tech, Web3"
   - Should not have character limit

5. Fill location preference
   - Type: "Remote, NYC"
   - Should not have character limit

6. Scroll up to verify summary/content still present
7. Click "Save Changes"
   - Should show toast: "Page updated"
   - Should redirect to founder profile page
```

### Verification
- [ ] Navigate back to your profile page
- [ ] Click on the founder page name
- [ ] Scroll to right sidebar
- [ ] Should see "Looking for Cofounders" card with:
  - [ ] Heart icon
  - [ ] Roles displayed as badges (CTO, CFO)
  - [ ] Stage: Seed
  - [ ] Focus: AI, Climate Tech, Web3
  - [ ] Location: Remote, NYC
  - [ ] "Express Interest" button

---

## Test Scenario 2: Cofounder Search & Discovery

### Setup
- You should have at least 1 founder with cofounder preferences enabled (from Test 1)

### Test Steps
1. Navigate to http://localhost:8081/cofounder-search
2. ✅ Page should load with:
   - [ ] Header: "Find Cofounders"
   - [ ] Filter section with controls
   - [ ] Results area
   - [ ] Pagination controls

### Test Filter Controls
```
ROLES FILTER:
1. Should see checkboxes for:
   - CTO
   - CFO
   - Product Lead
   - Business Dev
   - Designer
   - Other

2. Click multiple roles
   - Selections should persist
   - Results should filter in real-time

STAGE FILTER:
1. Click dropdown
2. Should show options:
   - Early stage
   - Pre-seed
   - Seed
   - Series A
3. Select "Seed"
4. Results should update

FOCUS AREA FILTER:
1. Type "AI" in Focus Area input
2. Should debounce (pause 300ms before searching)
3. Results should filter

LOCATION FILTER:
1. Type "Remote" in Location input
2. Should debounce
3. Results should filter

COMBINED FILTERS:
1. Select CTO role
2. Select Seed stage
3. Type "AI" in focus area
4. All filters should work together
5. Results should match ALL filters (AND logic)
```

### Test Results Display
```
For each founder card shown:
1. Should display:
   - Profile image (if available)
   - Founder name with verification badge
   - Summary/bio
   - Build Score with Rocket icon
   - Global Rank (if applicable)
   - Page Views with Eye icon
   - Their cofounder requirements:
     - Roles (as colored badges)
     - Stage label
     - Focus area
     - Location

2. Buttons:
   - "View Profile" → should navigate to founder page
   - "Express Interest" → (currently UI only, no action yet)
```

### Test Pagination
```
1. If more than 20 results:
   - Should show pagination controls at bottom
   - "Previous" button (disabled on first page)
   - Page info: "Page X of Y"
   - "Next" button

2. Click Next
   - Should load page 2 results
   - Filters should still be active
   - Previous button should now be enabled

3. Click Previous
   - Should go back to page 1
   - Results should match original
```

### Test Edge Cases
```
1. No results:
   - Set filters that match nothing
   - Should show "No cofounders found" message
   - Filters should still be visible
   - Should show "Clear filters" option

2. Debounce behavior:
   - Type fast in Focus Area: "A", "AI", "AIx" 
   - Should NOT make a request for each keystroke
   - Should wait 300ms after you stop typing

3. Filter combination:
   - Select CTO role AND Seed stage AND "AI" focus
   - Should only show founders matching ALL three
```

---

## Test Scenario 3: Profile Display

### Setup
- Have a founder with cofounder preferences enabled

### Test Steps
1. Navigate to http://localhost:8081 (home page)
2. Search for or navigate to a founder's page
3. Scroll right sidebar

### Verification - Non-Seeking Founder
- If `cofound_seeking = false`:
  - Should NOT see "Looking for Cofounders" card
  - Only see standard cards (Quick Facts, etc.)

### Verification - Seeking Founder
- If `cofound_seeking = true`:
  - Should see "Looking for Cofounders" card
  - Should show all preferences:
    - [ ] Roles (multi-role support)
    - [ ] Stage
    - [ ] Focus Area
    - [ ] Location
  - "Express Interest" button present

---

## Test Scenario 4: Mobile Responsiveness

### Setup
- Open dev tools (F12)
- Set viewport to mobile (iPhone 12, 390x844)

### Test Steps
1. Navigate to `/cofounder-search` on mobile
2. ✅ Header should stack properly
   - "Cofounders" nav link visible
   - "Cofounder Search" logo visible

3. ✅ Filters should be readable
   - Roles checkboxes should stack vertically
   - Dropdowns should work on mobile
   - Text inputs should be full width

4. ✅ Filter controls visibility
   - Filters should not overflow
   - Horizontal scroll should NOT be needed

5. ✅ Results cards
   - Should stack single column
   - Card content should be readable
   - Buttons should be tappable size

6. ✅ Pagination
   - Buttons should be touch-friendly
   - Page info should be visible

---

## Test Scenario 5: Edit Page Mobile

### Setup
- Mobile viewport (iPhone 12)

### Test Steps
1. Navigate to edit page on mobile
2. ✅ "Open to Cofounding?" section should expand/collapse
3. ✅ Checkboxes should be clickable
4. ✅ Dropdown should work on mobile
5. ✅ Text inputs should be full width
6. ✅ Save button should be accessible

---

## Test Scenario 6: Profile Page Mobile

### Setup
- Mobile viewport

### Test Steps
1. View founder profile on mobile
2. ✅ "Looking for Cofounders" card should be visible
3. ✅ Card content should be readable
4. ✅ Roles badges should display nicely
5. ✅ "Express Interest" button should be tappable

---

## Performance Testing

### Database Queries
```bash
# Check indexes exist
supabase db inspect founder_pages
# Should show:
# - idx_founder_pages_cofound_seeking
# - idx_founder_pages_cofound_stage
```

### Query Performance
```
Typical queries should execute in < 10ms:

SELECT * FROM founder_pages 
WHERE cofound_seeking = true 
ORDER BY build_score DESC 
LIMIT 20;
```

### Frontend Performance
1. Open DevTools → Network tab
2. Go to `/cofounder-search`
3. ✅ Initial load should be <2 seconds
4. ✅ Filter changes should update results in <500ms
5. ✅ Pagination clicks should load in <500ms

### Memory Leaks
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Do 10 filter changes
4. Take another heap snapshot
5. ✅ Memory usage should not increase significantly
6. ✅ No detached DOM nodes

---

## API/Database Testing

### Test Data Validation

#### Valid Roles
```javascript
cofound_roles = ["CTO", "CFO", "Product Lead", "Business Dev", "Designer", "Other"]
// ✅ Should save successfully
```

#### Valid Stages
```javascript
cofound_stage = "seed" | "early_stage" | "pre_seed" | "series_a"
// ✅ Should save successfully
```

#### Valid Text Fields
```javascript
cofound_focus_area = "AI, Climate Tech, Web3" // Can be any text
cofound_location_pref = "Remote, NYC, SF" // Can be any text
// ✅ Should save successfully
```

#### Empty/Null Cases
```javascript
// User toggles OFF cofounder seeking
cofound_seeking = false
cofound_roles = null
cofound_stage = null
cofound_focus_area = null
cofound_location_pref = null
cofound_updated_at = null
// ✅ Should save, founder not in search results
```

### Test SQL Filters

```sql
-- Should return only founders seeking cofounders
SELECT * FROM founder_pages 
WHERE cofound_seeking = true;

-- Should return founders with CTO role
SELECT * FROM founder_pages 
WHERE cofound_seeking = true 
AND 'CTO' = ANY(cofound_roles);

-- Should return founders at Seed stage
SELECT * FROM founder_pages 
WHERE cofound_seeking = true 
AND cofound_stage = 'seed';

-- Should return founders with "AI" in focus area (text search)
SELECT * FROM founder_pages 
WHERE cofound_seeking = true 
AND cofound_focus_area ILIKE '%AI%';
```

---

## Regression Testing

### Existing Features (Should NOT be broken)
- [ ] Create founder page still works
- [ ] Edit page (non-cofounder fields) still saves correctly
- [ ] Search page still works
- [ ] Leaderboard still displays correctly
- [ ] Profile page (existing sections) works
- [ ] Authentication still works
- [ ] Page analytics (view count) still tracked
- [ ] Build score calculation unchanged

---

## Bug Report Template

If you find an issue, report it like this:

```
## Bug: [Title]

### Reproduction Steps
1. 
2. 
3. 

### Expected Result
[What should happen]

### Actual Result
[What actually happened]

### Environment
- Browser: Chrome/Firefox/Safari
- Device: Desktop/Mobile
- OS: Windows/Mac/Linux
- URL: http://localhost:8081/...

### Screenshot/Video
[Attach if applicable]

### Console Errors
[Any JavaScript errors?]
```

---

## Testing Checklist

### Core Functionality
- [ ] Can toggle cofounder seeking ON/OFF
- [ ] Can select roles (multi-select works)
- [ ] Can select stage
- [ ] Can enter focus area
- [ ] Can enter location preference
- [ ] Data persists after save
- [ ] Founder appears in cofounder search
- [ ] Filters work correctly
- [ ] Results show cofounder info
- [ ] View Profile navigation works
- [ ] Express Interest button is visible

### UI/UX
- [ ] Collapsible sections work
- [ ] Icons display correctly
- [ ] Badges render properly
- [ ] Text is readable
- [ ] Responsive on mobile
- [ ] No layout shifts
- [ ] Loading states show
- [ ] Empty states display

### Performance
- [ ] Page loads fast (<2s)
- [ ] Filters debounce properly
- [ ] No memory leaks
- [ ] Database queries are indexed
- [ ] Pagination works

### Data Integrity
- [ ] Null values handled correctly
- [ ] Empty arrays work
- [ ] Text is properly trimmed
- [ ] Updates don't lose data
- [ ] No SQL injection possible

---

**Ready to test!** Run through these scenarios and report any issues. 🚀
