import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../../../services/artist.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-requests',
  imports: [CommonModule, FormsModule, NgIf, NgFor, NgClass, DatePipe],
  templateUrl: './requests.component.html'
})
export class RequestsComponent {
constructor(private artistService: ArtistService, private router:Router) {}

  requests: any[] = [];
  filteredRequests: any[] = [];
  eventDomains: string[] = [];
  commentCounts: Map<number, number> = new Map();

  // filters
  filterType: string = '';
  searchTitle: string = '';
  dateOrder: 'nearest' | 'oldest' = 'nearest';

  // sorting
  sortColumn: string = 'created_on';
  sortDirection: 'asc' | 'desc' = 'desc';

  async ngOnInit() {
    await this.loadRequests();
  }

  async loadRequests() {
    try {
      const data = await this.artistService.getAllArtistsRequests();
      // Filter to show requests with status 2 (Pending) and 3 (On Hold)
      this.requests = Array.isArray(data) ? data.filter(r => r.status === 2 || r.status === 3) : [];
      
      // Extract unique event domains for the filter dropdown
      const domains = this.requests
        .map(r => r.request_type)
        .filter((v, i, a) => v && a.indexOf(v) === i)
        .sort();
      this.eventDomains = domains;
      
      // Load comment counts for all requests
      await this.loadCommentCounts();
      
      this.applyFiltersAndSorting();
    } catch (err) {
      console.error('Failed to load requests', err);
      this.requests = [];
      this.filteredRequests = [];
      this.eventDomains = [];
    }
  }

  async loadCommentCounts() {
    try {
      // Fetch comment counts for all requests
      const countPromises = this.requests.map(async (request) => {
        const count = await this.artistService.getEventCommentCount(request.id_request);
        return { id: request.id_request, count };
      });
      
      const counts = await Promise.all(countPromises);
      
      // Store counts in the map
      this.commentCounts.clear();
      counts.forEach(({ id, count }) => {
        this.commentCounts.set(id, count);
      });
    } catch (err) {
      console.error('Failed to load comment counts', err);
    }
  }

  getCommentCount(requestId: number): number {
    return this.commentCounts.get(requestId) || 0;
  }

  onFilterChange() {
    this.applyFiltersAndSorting();
  }

  onDateOrderChange() {
    // Always switch to sorting by propose_date when date order is changed
    this.sortColumn = 'propose_date';
    this.sortDirection = this.dateOrder === 'nearest' ? 'asc' : 'desc';
    this.applyFiltersAndSorting();
  }

  toggleSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSorting();
  }

  private applyFiltersAndSorting() {
    const type = this.filterType.trim();
    const titleSearch = this.searchTitle.trim().toLowerCase();

    let rows = this.requests.slice();

    // filter by request_type (event domain) - exact match
    if (type) {
      rows = rows.filter(r => String(r.request_type || '') === type);
    }

    // filter by title search
    if (titleSearch) {
      rows = rows.filter(r => String(r.title || '').toLowerCase().includes(titleSearch));
    }

    // propose date nearest/oldest selector changes default sort hint
    if (this.sortColumn === 'propose_date') {
      this.sortDirection = this.dateOrder === 'nearest' ? 'asc' : 'desc';
    }

    // sort
    rows.sort((a: any, b: any) => this.compareByColumn(a, b, this.sortColumn, this.sortDirection));

    this.filteredRequests = rows;
  }

  private compareByColumn(a: any, b: any, column: string, direction: 'asc' | 'desc') {
    const factor = direction === 'asc' ? 1 : -1;

    // special handling for propose_date (array) and created_on (timestamp)
    if (column === 'propose_date') {
      // Handle both propose_date array and min field from view
      let aDate: number;
      let bDate: number;
      
      if (a?.propose_date && Array.isArray(a.propose_date) && a.propose_date.length > 0) {
        aDate = this.getNearestProposeDate(a.propose_date);
      } else if (a?.min) {
        aDate = new Date(a.min).getTime();
      } else {
        aDate = Number.MAX_SAFE_INTEGER;
      }
      
      if (b?.propose_date && Array.isArray(b.propose_date) && b.propose_date.length > 0) {
        bDate = this.getNearestProposeDate(b.propose_date);
      } else if (b?.min) {
        bDate = new Date(b.min).getTime();
      } else {
        bDate = Number.MAX_SAFE_INTEGER;
      }
      
      return (aDate - bDate) * factor;
    }

    if (column === 'created_on') {
      const aTime = a?.created_on ? new Date(a.created_on).getTime() : 0;
      const bTime = b?.created_on ? new Date(b.created_on).getTime() : 0;
      return (aTime - bTime) * factor;
    }

    const av = (a?.[column] ?? '').toString().toLowerCase();
    const bv = (b?.[column] ?? '').toString().toLowerCase();
    if (av < bv) return -1 * factor;
    if (av > bv) return 1 * factor;
    return 0;
  }

  getNearestProposeDate(arr: any): number {
    if (!Array.isArray(arr) || arr.length === 0) return Number.MAX_SAFE_INTEGER;
    const times = arr
      .map((d: any) => new Date(d).getTime())
      .filter((t: number) => !isNaN(t));
    if (times.length === 0) return Number.MAX_SAFE_INTEGER;
    // nearest interpreted as earliest upcoming date relative to now
    const now = Date.now();
    const future = times.filter(t => t >= now);
    const pool = future.length ? future : times; // if no future date, use all
    const sorted = pool.sort((x, y) => x - y);
    return sorted[0];
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Published';
      case 1: return 'Approved Request';
      case 2: return 'Pending';
      case 3: return 'On Hold';
      case 6: return 'Rejected';
      default: return String(status ?? '');
    }
  }

  navigateToDetail(id:any){
    this.router.navigate(['hosts/console/requests', id])
  }
}
