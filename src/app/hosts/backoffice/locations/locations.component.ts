import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../../services/location.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-locations',
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.component.html',
  standalone: true,
})
export class LocationsComponent implements OnInit {
  allLocations: any[] = [];
  locations: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;
  showFilters: boolean = false;

  // dropdown data
  cities: string[] = [];
  amenities: any[] = [];
  specs: any[] = [];
  types: any[] = [];

  // mapping indexes: location id -> Set of ids
  locationIdToAmenityIds: Map<number, Set<number>> = new Map();
  locationIdToSpecIds: Map<number, Set<number>> = new Map();
  locationIdToTypeIds: Map<number, Set<number>> = new Map();

  // filters
  searchName: string = '';
  filterCity: string = '';
  filterStatus: boolean | '' = '';
  filterAmenityId: string = '';
  filterSpecId: string = '';
  filterTypeId: string = '';

  // sorting
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private locationService: LocationService, private router: Router) {}

  ngOnInit(): void {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    try {
      const [rows, amenMapRows, specMapRows, typeMapRows, sysAmen, sysSpecs, sysTypes] = await Promise.all([
        this.locationService.getallLocation(),
        this.locationService.listAllLocationAmenities(),
        this.locationService.listAllLocationSpecs(),
        this.locationService.listAllLocationTypes(),
        this.locationService.getSysAmenity(),
        this.locationService.getSysSpecs(),
        this.locationService.getSysTypes(),
      ]);

      this.allLocations = Array.isArray(rows) ? rows : [];
      this.locations = [...this.allLocations];

      // build city list
      const citySet = new Set<string>();
      for (const loc of this.allLocations) {
        const city = (loc?.city || '').toString();
        if (city.trim().length > 0) citySet.add(city);
      }
      this.cities = Array.from(citySet).sort((a, b) => a.localeCompare(b));

      // build sys lists
      this.amenities = Array.isArray(sysAmen) ? sysAmen : [];
      this.specs = Array.isArray(sysSpecs) ? sysSpecs : [];
      this.types = Array.isArray(sysTypes) ? sysTypes : [];

      // build mapping indexes
      this.locationIdToAmenityIds = this.buildLocationIndex(amenMapRows, 'id_location', 'id_amenity');
      this.locationIdToSpecIds = this.buildLocationIndex(specMapRows, 'id_location', 'id_specs');
      this.locationIdToTypeIds = this.buildLocationIndex(typeMapRows, 'id_location', 'id_location_type');

      this.applyFiltersAndSort();
    } catch (err: any) {
      this.errorMessage = err?.message || 'Failed to load locations';
    } finally {
      this.loading = false;
    }
  }

  private buildLocationIndex(rows: any[], idKey: string, valueKey: string): Map<number, Set<number>> {
    const index = new Map<number, Set<number>>();
    if (!Array.isArray(rows)) return index;
    for (const r of rows) {
      const locId = Number((r as any)?.[idKey]);
      const valId = Number((r as any)?.[valueKey]);
      if (!Number.isFinite(locId) || !Number.isFinite(valId)) continue;
      if (!index.has(locId)) index.set(locId, new Set<number>());
      index.get(locId)!.add(valId);
    }
    return index;
  }

  getStatusLabel(status: any): string {
    return +status === 1 ? 'Active' : 'Inactive';
  }

  createNew(): void {
    this.router.navigate(['hosts/console/locations/create']);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  setSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSort();
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  clearFilters(): void {
    this.searchName = '';
    this.filterCity = '';
    this.filterStatus = '';
    this.filterAmenityId = '';
    this.filterSpecId = '';
    this.filterTypeId = '';
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort(): void {
    let rows = [...this.allLocations];

    const search = this.searchName.trim().toLowerCase();
    if (search.length > 0) {
      rows = rows.filter((r: any) => (r?.name || '').toString().toLowerCase().includes(search));
    }

    if (this.filterCity) {
      rows = rows.filter((r: any) => (r?.city || '') === this.filterCity);
    }

    if (this.filterStatus !== '') {
      const desired = this.filterStatus as boolean;
      rows = rows.filter((r: any) => {
        const val = (r as any)?.is_active;
        const active = val === true || val === 1 || val === '1';
        return active === desired;
      });
    }

    if (this.filterAmenityId) {
      const amenId = Number(this.filterAmenityId);
      rows = rows.filter((r: any) => this.locationIdToAmenityIds.get(Number(r?.id))?.has(amenId));
    }

    if (this.filterSpecId) {
      const specId = Number(this.filterSpecId);
      rows = rows.filter((r: any) => this.locationIdToSpecIds.get(Number(r?.id))?.has(specId));
    }

    if (this.filterTypeId) {
      const typeId = Number(this.filterTypeId);
      rows = rows.filter((r: any) => this.locationIdToTypeIds.get(Number(r?.id))?.has(typeId));
    }

    if (this.sortColumn) {
      const col = this.sortColumn;
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      rows.sort((a: any, b: any) => {
        const av = a?.[col];
        const bv = b?.[col];
        if (av == null && bv == null) return 0;
        if (av == null) return -1 * dir;
        if (bv == null) return 1 * dir;
        // numeric compare for known numeric fields
        const numericColumns = new Set(['id', 'is_active', 'capacity']);
        if (numericColumns.has(col)) {
          const an = Number(av);
          const bn = Number(bv);
          return (an - bn) * dir;
        }
        // date compare for created_on
        if (col === 'created_on') {
          const ad = new Date(av).getTime();
          const bd = new Date(bv).getTime();
          return (ad - bd) * dir;
        }
        // string compare
        const as = av.toString().toLowerCase();
        const bs = bv.toString().toLowerCase();
        return as.localeCompare(bs) * dir;
      });
    }

    this.locations = rows;
  }

  navigateTo(id: any): void {
    this.router.navigate([`hosts/console/locations/${id}`]);
  }


}
