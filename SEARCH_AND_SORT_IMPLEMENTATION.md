# Event Requests - Search and Sort Implementation

## Features Added

### 1. **Search Functionality**

#### Search by Title
- Real-time search as you type
- Case-insensitive matching
- Searches within event titles
- Clear button (X icon) appears when search is active

#### Search UI Components
- Search input with magnifying glass icon
- Clear search button (shows only when there's a search query)
- Results count display: "Showing X of Y requests"
- Updated empty state for "No Matching Requests Found"

### 2. **Column Sorting**

#### Sortable Columns
1. **Title** - Alphabetical sorting
2. **Event Domain** - Alphabetical sorting
3. **Date Created** - Chronological sorting
4. **Status** - Numeric sorting (0, 1, 2)

#### Sort Indicators
- 🔽 Sort descending (active)
- 🔼 Sort ascending (active)
- ⬍ Unsorted (inactive column)

#### Sort Behavior
- Click a column header to sort by that column
- First click: Ascending order
- Second click: Descending order
- Clicking a different column switches to that column (ascending)
- Default sort: Date Created (descending) - newest first

### 3. **Status Filter Enhancement**

#### Active Filter Indicator
- Active filter button has:
  - Darker background color
  - Ring border effect
  - Darker text color
- Inactive buttons have lighter colors with hover effects

#### Filter Options
- **Draft (1)**: Yellow badge
- **Pending (2)**: Blue badge  
- **Published (0)**: Green badge
- **All (4)**: Gray badge - shows all statuses

## Implementation Details

### TypeScript Component (`request.component.ts`)

#### New Properties
```typescript
// Search and sort
searchQuery: string = '';
sortColumn: string = 'created_on';
sortDirection: 'asc' | 'desc' = 'desc';
currentStatusFilter: number = 4; // 4 means "All"
```

#### Key Methods

##### `onSearchChange()`
```typescript
onSearchChange(): void {
  this.applySearchAndSort();
}
```
- Triggered on every keystroke in search input
- Calls `applySearchAndSort()` to update the displayed data

##### `sortBy(column: string)`
```typescript
sortBy(column: string): void {
  if (this.sortColumn === column) {
    // Toggle direction if clicking the same column
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    // Default to ascending for new column
    this.sortColumn = column;
    this.sortDirection = 'asc';
  }
  this.applySearchAndSort();
}
```
- Handles column header clicks
- Toggles sort direction for the same column
- Sets new column with ascending direction

##### `applySearchAndSort()`
```typescript
private applySearchAndSort(): void {
  let filtered = [...this.originalData];

  // Apply status filter first
  if (this.currentStatusFilter !== 4) {
    filtered = filtered.filter((item: any) => item.status === this.currentStatusFilter);
  }

  // Apply search filter
  if (this.searchQuery && this.searchQuery.trim()) {
    const query = this.searchQuery.toLowerCase().trim();
    filtered = filtered.filter((event: any) => 
      event.title?.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  filtered.sort((a: any, b: any) => {
    // ... sorting logic
  });

  this.ardata = filtered;
}
```
- Central method that applies all filters and sorting
- Order of operations:
  1. Status filter
  2. Search filter
  3. Sorting
- Always works from `originalData` to ensure consistency

##### `clearSearch()`
```typescript
clearSearch(): void {
  this.searchQuery = '';
  this.applySearchAndSort();
}
```
- Clears the search query
- Reapplies filters and sorting

##### `getDataByStatus(status: number)`
```typescript
getDataByStatus(status: number): void {
  this.currentStatusFilter = status;
  this.applySearchAndSort();
}
```
- Updates the current status filter
- Triggers reapplication of all filters

### HTML Template Updates

#### Search Input
```html
<div class="relative">
  <input 
    type="text" 
    [(ngModel)]="searchQuery"
    (ngModelChange)="onSearchChange()"
    placeholder="Search by title..."
    class="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg"
  />
  <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
    <i class="fas fa-search text-gray-400"></i>
  </div>
  <button 
    *ngIf="searchQuery"
    (click)="clearSearch()"
    class="absolute inset-y-0 right-0 pr-3 flex items-center"
  >
    <i class="fas fa-times"></i>
  </button>
</div>
```

#### Sortable Column Header
```html
<th 
  (click)="sortBy('title')"
  class="px-4 py-3 cursor-pointer hover:bg-gray-100"
>
  <div class="flex items-center gap-1">
    <span>Title</span>
    <i 
      class="fas"
      [ngClass]="{
        'fa-sort': sortColumn !== 'title',
        'fa-sort-up': sortColumn === 'title' && sortDirection === 'asc',
        'fa-sort-down': sortColumn === 'title' && sortDirection === 'desc'
      }"
    ></i>
  </div>
</th>
```

#### Status Filter Button
```html
<button 
  (click)="getDataByStatus(2)"
  [ngClass]="{
    'bg-blue-400 text-blue-900 ring-2 ring-blue-500': currentStatusFilter === 2,
    'bg-blue-200 text-blue-800 hover:bg-blue-300': currentStatusFilter !== 2
  }"
  class="px-3 py-1.5 rounded-full text-xs font-medium"
>
  Pending
</button>
```

## User Experience Flow

### Scenario 1: Search for a Request
1. User types "concert" in the search box
2. Table updates in real-time to show only matching titles
3. Results count shows: "Showing 2 of 10 requests"
4. If no matches found, empty state shows search icon with "No Matching Requests Found"
5. User clicks X to clear search and see all results again

### Scenario 2: Sort by Date
1. User clicks "Date Created" column header
2. Arrow changes to up arrow (ascending)
3. Table reorders with oldest requests first
4. User clicks again, arrow changes to down arrow (descending)
5. Table reorders with newest requests first

### Scenario 3: Filter by Status and Search
1. User clicks "Pending" filter button
2. Table shows only pending requests
3. Button gets darker background with ring border
4. User types "workshop" in search
5. Table shows only pending requests with "workshop" in title
6. Results count: "Showing 1 of 3 requests"

### Scenario 4: Sort Filtered Results
1. User has "Published" filter active
2. User searches for "festival"
3. User clicks "Title" column to sort alphabetically
4. Table shows published festival events in A-Z order
5. All three filters (status, search, sort) work together

## Performance Considerations

### Efficient Filtering
- All operations work on arrays in memory
- No database queries during search/sort/filter
- Original data is loaded once
- Filters applied on client side

### Real-time Search
- `ngModelChange` event triggers on every keystroke
- No debouncing implemented (can be added if needed)
- Immediate visual feedback for user

## Future Enhancements

### Potential Improvements
1. **Debounced Search**
   - Add 300ms delay before applying search
   - Reduces unnecessary filter operations
   - Improves performance for large datasets

2. **Advanced Search**
   - Search across multiple fields (title, teaser, description)
   - Add search operators (AND, OR, NOT)
   - Add date range filters

3. **Sort Memory**
   - Remember user's sort preference
   - Store in localStorage
   - Apply on page reload

4. **Multi-column Sort**
   - Sort by primary and secondary columns
   - e.g., Status → Date Created

5. **Export Filtered Results**
   - Download current filtered/sorted view as CSV
   - Include only visible columns

6. **Search Highlighting**
   - Highlight matching text in results
   - Makes it easier to see why a result matched

## Testing Checklist

- [x] Search filters results in real-time
- [x] Search is case-insensitive
- [x] Clear button removes search query
- [x] Sort indicators show correct direction
- [x] Clicking column header sorts data
- [x] Toggle between ascending/descending works
- [x] Status filters work with search
- [x] Status filters work with sorting
- [x] Active filter button shows visual feedback
- [x] Results count displays correctly
- [x] Empty state adapts for search vs. no data
- [x] All filters work together (status + search + sort)

## Code Files Modified

1. **request.component.ts**
   - Added search, sort, and filter state properties
   - Implemented `onSearchChange()`, `sortBy()`, `clearSearch()`
   - Refactored `applySearchAndSort()` to combine all filters
   - Updated `getDataByStatus()` to work with combined filters

2. **request.component.html**
   - Added search input with icons
   - Added results count display
   - Made column headers clickable with sort indicators
   - Enhanced status filter buttons with active state
   - Updated empty state for search scenarios

## Dependencies

- **FormsModule**: Required for `[(ngModel)]` two-way binding
- **FontAwesome Icons**: For search, sort, and clear icons
- **Tailwind CSS**: For styling and responsive design
