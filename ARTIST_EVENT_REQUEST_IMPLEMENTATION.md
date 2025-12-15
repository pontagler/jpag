# Artist Event Request Implementation

## Overview
This document describes the implementation of the Artist Event Request feature, which allows artists to create event requests in their artistspace. These requests go to hosts for review, editing, and approval.

## Features Implemented

### 1. **Tab-Based Interface**
- **New Event Request Tab**: Create new event requests with a 6-step form
- **All Requests Tab**: View all submitted event requests with status filters

### 2. **Six-Step Event Request Form**

#### Step 1: Details
- Event Domain (optional)
- Event Title (required, max 200 chars)
- Teaser (short description, max 200 chars)
- Long Teaser (extended preview)
- Description (required, max 2000 chars)

#### Step 2: Dates
- Date Type selection:
  - **Single Day**: Requires start date and time
  - **Period (Multi-Days)**: Requires start and end dates
- Multiple dates can be added
- Automatic validation based on date type

#### Step 3: Image
- Upload event image (PNG/JPG, up to 5MB)
- Photo credit field (optional)
- Image preview functionality

#### Step 4: Media
- Add multiple media items (Videos or CDs)
- For each media item:
  - Type selection (Video/CD)
  - Title (required)
  - Description (optional)
  - URL (optional)
  - Cover image upload

#### Step 5: Artists
- Select artists from available list
- For each artist, select their instruments
- Multiple instruments per artist supported
- **New Artist Feature**:
  - If artist not on list, provide name and email
  - System sends Supabase signup email to the artist
  - Artist is added to database with pending status
  - Comment automatically added to request

#### Step 6: Comments
- Textarea for additional comments to the host
- Auto-populated with new artist signup information
- **Saved to the `comments` column in the events table**
- Visible to host when reviewing the request
- Displayed in the artist's "All Requests" view

### 3. **Status Management**
- All event requests automatically saved with **status = 2** (Pending Review)
- Artists can view requests filtered by status:
  - Draft (status 1)
  - Pending Review (status 2)
  - Published (status 3)

### 4. **Request Management**
- **Revoke Request**: Artists can delete/revoke requests with status 2
- Confirmation dialog before deletion
- Automatic removal from list after deletion

## Technical Implementation

### Component Structure
```
src/app/artistspace/profile/request/
├── request.component.ts      (Logic & Forms)
└── request.component.html    (UI Template)
```

### Forms Architecture
Uses Angular Reactive Forms with FormBuilder:
- `detailsForm`: Event details fields
- `datesForm`: Date entries (FormArray)
- `imageForm`: Image upload and credit
- `mediaForm`: Media items (FormArray)
- `artistsForm`: Artist selection
- `commentsForm`: Additional comments

### Service Methods Added

#### ArtistService
```typescript
// Send signup email via Supabase Auth
async sendArtistSignupEmail(email: string, name: string): Promise<void>

// Add pending artist to database
async addPendingArtist(name: string, email: string): Promise<string>
```

#### EventService
```typescript
// Get events created by artist (status 2)
async getEventsByArtist(artistId: string): Promise<any[]>
```

### Data Flow
1. Artist creates request through 6-step form
2. Each step validates and saves data immediately
3. Final submission with status = 2
4. Request appears in host's backoffice for review
5. Artist can view and revoke pending requests

## UI/UX Features

### Step Progress Indicator
- Visual indicator showing current step
- Colored highlighting for active step
- Disabled navigation buttons (non-clickable tabs)

### Validation
- Required field validation at each step
- Character count indicators
- Date type conditional validation
- Image file type and size validation

### Loading States
- Spinner indicators during save operations
- Disabled buttons during processing
- Loading state for instrument selection

### Empty States
- Helpful message when no requests exist
- Call-to-action button to create first request
- Empty state for artist rows

## Integration Points

### With Host Backoffice
- Event requests appear in host's event list with status 2
- Hosts can edit and approve/reject requests
- Status changes reflect in artist's view

### With Supabase
- Authentication via Supabase Auth
- File storage in events bucket
- Database tables:
  - `events` - Main event data
  - `event_dates` - Date/time entries
  - `event_media` - Media items
  - `event_artists` - Artist linkage
  - `event_instruments` - Instrument assignments
  - `artists` - Artist information

## Database Schema

### Events Table
```sql
events (
  id: integer (auto)
  title: varchar(200)
  teaser: varchar(200)
  long_teaser: text
  description: text(2000)
  photo: text (URL)
  credit_photo: varchar
  status: integer (2 for requests)
  created_by: uuid (artist auth ID)
  id_host: integer (nullable)
  id_event_domain: integer
  id_event_type: integer
  ...
)
```

## Styling
- Uses Tailwind CSS utility classes
- Custom colors:
  - `pont-green`: Primary action buttons
  - `pont-rust`: Submit button
- Responsive design with mobile support
- Consistent with existing artistspace design

## Future Enhancements
1. Draft saving before submission
2. Edit submitted requests (before host review)
3. Comment thread between artist and host
4. Notification system for status changes
5. File validation and compression
6. Multi-language support

## Testing Checklist
- [ ] Create event request with all 6 steps
- [ ] Validate required fields
- [ ] Add single day date with time
- [ ] Add multi-day period date
- [ ] Upload event image
- [ ] Add video media item
- [ ] Add CD media item
- [ ] Select existing artist with instruments
- [ ] Send signup email to new artist
- [ ] Add comments
- [ ] Submit complete request
- [ ] View all requests tab
- [ ] Filter by status
- [ ] Revoke pending request

## Known Limitations
1. Edition field not required (artists may not know edition details)
2. No draft auto-save functionality
3. Cannot edit after submission (must revoke and recreate)

## Files Modified
1. `src/app/artistspace/profile/request/request.component.ts` - Complete rewrite
2. `src/app/artistspace/profile/request/request.component.html` - Complete rewrite
3. `src/app/services/artist.service.ts` - Added 2 methods
4. `src/app/services/event.service.ts` - Added 1 method

---
**Implementation Date**: December 15, 2025  
**Status**: Complete and ready for testing
