import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-editions',
  templateUrl: './editions.component.html',
  standalone: false
})
export class EditionsComponent implements OnInit {
  constructor(
    private router: Router,
    private eventService: EventService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.getAllEditions();
  }

  // UI state
  showFilters: boolean = false;
  isLoading: boolean = false;

  // Filters
  searchQuery: string = '';
  editionTypeFilter: 'All' | string = 'All';

  // Sorting
  sortKey: keyof EditionRow = 'year';
  sortDirection: 'asc' | 'desc' = 'desc';

  editions: EditionRow[] = [];
  editionTypes: Array<{ id: number; name: string }> = [];

  get uniqueEditionTypes(): string[] {
    const values = new Set<string>();
    for (const e of this.editions) {
      if (e.editionTypeName && e.editionTypeName.trim().length > 0) values.add(e.editionTypeName);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  get displayedEditions(): EditionRow[] {
    // Filter
    let result = this.editions.filter((e) => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesQuery = q
        ? (
            (e.name && e.name.toLowerCase().includes(q)) ||
            (e.year && e.year.toLowerCase().includes(q)) ||
            (e.editionTypeName && e.editionTypeName.toLowerCase().includes(q))
          )
        : true;

      const matchesEditionType = this.editionTypeFilter === 'All' ? true : e.editionTypeName === this.editionTypeFilter;

      return matchesQuery && matchesEditionType;
    });

    // Sort
    const key = this.sortKey;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    result.sort((a: EditionRow, b: EditionRow) => {
      const va = a[key] as any;
      const vb = b[key] as any;

      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir;
      }

      return String(va ?? '').localeCompare(String(vb ?? '')) * dir;
    });

    return result;
  }

  setSort(key: keyof EditionRow): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }

  createNew(): void {
    this.router.navigate(['/hosts/console/editions/create']);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.editionTypeFilter = 'All';
  }

  navigateTo(id: any): void {
    this.router.navigate([`hosts/console/editions/${id}/edit`]);
  }

  async getAllEditions() {
    this.isLoading = true;
    try {
      const res = await this.eventService.listAllEditions();
      this.editions = (res || []).map((row: any) => {
        const editionType = row.sys_event_edition;
        return {
          id: row.id,
          name: row.name || '',
          year: row.year || '',
          id_edition_type: row.id_edition_type,
          editionTypeName: editionType?.name || '',
          created_on: row.created_on ? new Date(row.created_on) : null,
          last_update: row.last_update ? new Date(row.last_update) : null
        } as EditionRow;
      });

      // Load edition types for filter
      const types = await this.eventService.listSysEventEditions();
      this.editionTypes = types || [];
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    } finally {
      this.isLoading = false;
    }
  }
}

export interface EditionRow {
  id: number;
  name: string;
  year: string;
  id_edition_type: number | null;
  editionTypeName: string;
  created_on: Date | null;
  last_update: Date | null;
}


