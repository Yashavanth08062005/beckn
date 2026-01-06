# Implementation Plan - Fix Local Experience Search

Fix the "No Results Found" issue and enable proper filtering for local experiences. This involves changes to both the frontend UI and the Experience BPP backend.

## User Review Required

> [!NOTE]
> This plan modifies the backend service `experiencesService.js` to map airport codes (BOM, DEL, etc.) to city names. This ensures that searches using airport codes (common in flight booking) correctly find experiences in those cities.

## Proposed Changes

### Frontend (`frontend-travel-discovery`)

#### [MODIFY] [FilterSidebar.jsx](file:///e:/bvb/5th%20Sem/mini%20project/final/beckn-final/frontend-travel-discovery/src/components/FilterSidebar.jsx)
- **Problem**: The "Experience" category is missing from the Transport Mode filter sidebar, making it impossible to explicitly filter for experiences or see them if other filters are applied.
- **Change**: Add "experience" to the list of modes in the `Travel Mode` checkbox group.

### Backend (`travel-discovery-bpp-experiences`)

#### [MODIFY] [experiencesService.js](file:///e:/bvb/5th%20Sem/mini%20project/final/beckn-final/travel-discovery-bpp-experiences/src/services/experiencesService.js)
- **Problem**: The Experience BPP performs a text search on the `city` column. When the frontend sends a search with an Airport Code (e.g., "BOM", "BLR") as the destination—which happens during "All" mode searches or Flight searches—the BPP fails to match this with the full city name (e.g., "Mumbai", "Bangalore").
- **Change**: Update the `normalizeCityName` method to include mappings for common airport codes (BOM -> Mumbai, DEL -> Delhi, etc.) to ensure reliable matching.

## Verification Plan

### Automated Tests
- Run `node test-experience-search.js` to verify basic connectivity is maintained.
- Create a new test script `test-experience-airport-code.js` that mimics a search using an airport code (e.g., "BOM") and asserts that experiences for "Mumbai" are returned.

### Manual Verification
1.  **Sidebar Filter**:
    - Build and run the local frontend.
    - Navigate to the search results page.
    - Verify that "Experience" appears in the "Travel Mode" filter section.
    - Check the "Experience" box and ensure experience cards are displayed.
2.  **Airport Code Search**:
    - Perform a search with "BOM" or "DEL" as the destination (using "All" or "Flight" mode).
    - Verify that experience results for Mumbai/Delhi appear in the results list (if "All" mode).
