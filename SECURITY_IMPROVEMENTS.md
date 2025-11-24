# Security Improvements - HTML Sanitization

## Issue Identified
The system was accepting and potentially rendering HTML codes in user-generated content fields (event descriptions, artist bios, location information, etc.), which could lead to Cross-Site Scripting (XSS) vulnerabilities.

## Solution Implemented
Created a comprehensive HTML sanitization system using a custom Angular pipe that strips all HTML tags and potentially dangerous JavaScript patterns from user-generated content before display.

## Files Created

### 1. `src/app/shared/strip-html.pipe.ts`
- **Purpose**: Custom Angular pipe to sanitize user-generated content
- **Features**:
  - Removes all HTML tags
  - Strips JavaScript patterns (`javascript:`, `on*=` event handlers)
  - Removes `<script>` tags
  - Returns clean text content only

## Files Modified

### Visitor Section (Public-Facing)

#### Event Components
1. **`src/app/visitor/events/detail/detail.component.ts`** & **`.html`**
   - Sanitized: `event.title`, `event.editionDisplay`, `event.teaser`, `event.description`
   - Sanitized artist data: `artist.name`, `artist.tagline`, `artist.short_bio`
   - Sanitized media data: `media.title`, `media.description`

2. **`src/app/visitor/events/events.component.ts`** & **`.html`**
   - Sanitized: `event.editionDisplay`, `event.title`, `event.artistDisplay`, `event.description`

3. **`src/app/visitor/home/home.component.ts`** & **`.html`**
   - Sanitized event listings: `event.editionDisplay`, `event.title`, `event.teaser`
   - Sanitized artist data: `artist.tagline`

#### Artist Components
4. **`src/app/visitor/artists/artists.component.ts`** & **`.html`**
   - Sanitized: `artist.fname`, `artist.lname`, `artist.teaser`, `artist.tagline`, `artist.short_bio`

5. **`src/app/visitor/artists/detail/detail.component.ts`** & **`.html`**
   - Sanitized: `artist.fname`, `artist.lname`, `artist.title`, `artist.long_bio`, `artist.short_bio`
   - **Critical Fix**: Replaced dangerous `[innerHTML]="artist.long_bio"` with safe interpolation + sanitization
   - Sanitized instrument names

#### Location Components
6. **`src/app/visitor/locations/locations.component.ts`** & **`.html`**
   - Sanitized: `location.location`, `location.city`, `location.description`

7. **`src/app/visitor/locations/detail/detail.component.ts`** & **`.html`**
   - Sanitized: `location.name`, `location.address`, `location.zip`, `location.description`, `location.public_description`

### Backoffice Section (Admin Panel)

#### Event Management
8. **`src/app/hosts/backoffice/events/events.component.html`**
   - Sanitized event listings: `event.event`, `event.programme`, `event.title`, `event.location`

9. **`src/app/hosts/backoffice/events/event-detail/event-detail.component.ts`** & **`.html`**
   - Sanitized: `event.editionDisplay`, `event.title`, `event.teaser`, `event.description`
   - Sanitized instrument names and show data: `piece.composer`, `piece.piece`, `piece.duration`

10. **`src/app/hosts/backoffice/backoffice.module.ts`**
    - Added `StripHtmlPipe` to module imports for use across all backoffice components

## Security Benefits

### 1. **XSS Prevention**
- All user-generated content is now stripped of HTML tags and JavaScript
- Prevents injection of malicious scripts through form submissions
- Protects both visitor-facing and admin-facing interfaces

### 2. **Defense in Depth**
- Applies to both frontend display AND backend admin panels
- Even if malicious content is stored in the database, it won't execute

### 3. **Critical Vulnerability Fixed**
- Removed dangerous `[innerHTML]` binding in artist biography section
- This was a high-risk XSS vulnerability that could have allowed script execution

### 4. **Comprehensive Coverage**
Applied sanitization to all user-generated text fields:
- Event titles, descriptions, teasers
- Artist names, taglines, biographies
- Location names, addresses, descriptions
- Show/performance information
- Media titles and descriptions

## Testing Recommendations

1. **Test with HTML Input**
   - Try entering HTML tags like `<script>alert('XSS')</script>` in event descriptions
   - Verify that only the text content "alert('XSS')" appears (without the script tags)

2. **Test with JavaScript**
   - Try entering `<a href="javascript:alert('XSS')">Click me</a>`
   - Verify that the link text appears but the JavaScript is stripped

3. **Test Normal Formatting**
   - Verify that line breaks (`\n`) are preserved using `whitespace-pre-line` CSS class
   - Test with long text to ensure proper display

4. **Test in Both Contexts**
   - Test in visitor-facing pages (public view)
   - Test in backoffice admin panels

## Notes

- **Angular's Default Behavior**: Angular already escapes HTML in `{{ }}` interpolation by default, but this pipe provides an extra layer of security
- **Performance**: The pipe is marked as `pure`, so it only recalculates when input changes
- **Preserved Formatting**: Used `whitespace-pre-line` CSS class to preserve line breaks in multi-line text fields
- **Future Considerations**: If rich text formatting is needed in the future, use Angular's `DomSanitizer.sanitize()` with `SecurityContext.HTML` instead of stripping all HTML

## Impact

- **Security Level**: HIGH - Prevents stored XSS attacks
- **Breaking Changes**: None - Content will still display correctly, just without HTML
- **User Experience**: Improved - Users can no longer accidentally break layout with HTML tags
- **Maintenance**: Low - Single pipe applied consistently across the application

