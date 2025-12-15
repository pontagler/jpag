# Artist Event Request - Display Fix

## Problem
Artists were unable to see their event requests in the "All Requests" section. The component was showing "Unable to load requests. Please refresh the page." even though requests existed in the database.

## Root Cause
The component was trying to get the artist's auth ID from the ArtistService signals (`getArtistID()` and `getArtistProfileID()`), but these signals were not being set properly when:
1. The user navigated directly to the request page
2. The user refreshed the page
3. The profile component hadn't loaded yet

## Solution

### 1. **Added AuthService dependency**
- Import and inject AuthService into the request component
- This allows direct access to the authenticated user's information

### 2. **Updated `ngOnInit()` method**
```typescript
// Get the authenticated user's ID directly from auth service
const currentUser = await this.authService.getCurrentUser();
const authUserId = currentUser.id;

// Set the authID to use for created_by
this.authID = authUserId;
this.createdBy = authUserId;

// Try to get the artist record using the auth user ID
const artistProfile = await this.artistService.getArtistProfile_v2(authUserId);
if (artistProfile && artistProfile.artist) {
  this.artistID = artistProfile.artist.id;
}
```

### 3. **Simplified `getRequest()` method**
- Removed complex fallback logic
- Directly uses the authID that was set in ngOnInit
- Queries events table where `created_by` matches the auth user ID

### 4. **Updated `getEventsByArtist()` in EventService**
- Added documentation clarifying that the parameter should be the auth user ID (id_profile)
- This matches the `created_by` column in the events table

## Database Schema Understanding

### Artists Table
- `id` - Artist's unique ID (integer)
- `id_profile` - References the auth user ID from auth.users (UUID)

### Events Table
- `id` - Event's unique ID
- `created_by` - The auth user ID who created the event (UUID)

### Query Logic
When an artist creates an event request:
1. The `events.created_by` field is set to the authenticated user's ID (UUID from auth.users)
2. To fetch all requests for an artist, we query: `SELECT * FROM events WHERE created_by = [auth_user_id]`

## Testing
To verify the fix works:
1. Log in as an artist
2. Navigate to the "All Requests" tab
3. The system should:
   - Get your auth user ID from the auth service
   - Query the events table where created_by matches your ID
   - Display all your event requests

## Files Modified
1. `src/app/artistspace/profile/request/request.component.ts`
   - Added AuthService import and injection
   - Updated ngOnInit to get auth user directly
   - Simplified getRequest method

2. `src/app/services/event.service.ts`
   - Added documentation to getEventsByArtist method
   - Clarified that the parameter should be the auth user ID

## Example Query
For artist Fiona with auth ID `a685d648-c26a-4c3c-8c43-580ed223509e`:

```sql
-- Get artist record
SELECT * FROM artists WHERE fname ILIKE 'Fiona%'
-- Returns: id_profile = 'a685d648-c26a-4c3c-8c43-580ed223509e'

-- Get all event requests created by this artist
SELECT * FROM events WHERE created_by = 'a685d648-c26a-4c3c-8c43-580ed223509e'
```

## Result
Artists can now see all their event requests (Draft, Pending Review, Published) in the "All Requests" section, with the ability to:
- Filter by status
- Edit pending requests
- Revoke pending requests
- See request details including comments
