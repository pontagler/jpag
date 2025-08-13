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

  // filters
  filterType: string = '';
  filterStatus: string = '';
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
      this.requests = Array.isArray(data) ? data : [];
      this.applyFiltersAndSorting();
    } catch (err) {
      console.error('Failed to load requests', err);
      this.requests = [];
      this.filteredRequests = [];
    }
  }

  onFilterChange() {
    this.applyFiltersAndSorting();
  }

  onDateOrderChange() {
    // If currently sorting by propose_date, adjust direction to match selected order
    if (this.sortColumn === 'propose_date') {
      this.sortDirection = this.dateOrder === 'nearest' ? 'asc' : 'desc';
    }
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
    const type = this.filterType.trim().toLowerCase();
    const status = this.filterStatus.trim();

    let rows = this.requests.slice();

    // filter by request_type
    if (type) {
      rows = rows.filter(r => String(r.request_type || '').toLowerCase() === type);
    }

    // filter by status
    if (status) {
      rows = rows.filter(r => String(r.status) === status);
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
      const aDate = this.getNearestProposeDate(a?.propose_date);
      const bDate = this.getNearestProposeDate(b?.propose_date);
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
      case 1: return 'New';
      case 2: return 'Approved';
      case 3: return 'Rejected';
      default: return String(status ?? '');
    }
  }

  navigateToDetail(id:any){
    this.router.navigate(['hosts/console/requests', id])
  }
}
