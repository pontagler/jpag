import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitorService } from '../../services/visitor.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './locations.component.html'
})
export class LocationsComponent implements OnInit {

  constructor(
    private visitorService: VisitorService,
    private alertService: AlertService,
    private router: Router
  ) {}

  // Data
  allLocations: any[] = [];
  filteredLocations: any[] = [];

  // UI state
  isLoading: boolean = true;
  showFilters: boolean = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm: string = '';

  // Filter selections
  selectedCity: string = '';
  selectedCapacity: 'all' | 'under100' | '100-300' | 'over300' = 'all';
  selectedType: string = '';
  selectedSpec: string = '';
  selectedAmenity: string = '';

  // Option lists
  cityOptions: string[] = [];
  typeOptions: string[] = [];
  specOptions: string[] = [];
  amenityOptions: string[] = [];

  async ngOnInit(): Promise<void> {
    await this.loadLocations();
  }

  private async loadLocations(): Promise<void> {
    this.isLoading = true;
    try {
      const data = await this.visitorService.getLocationList();
      this.allLocations = Array.isArray(data) ? data : [];
      this.filteredLocations = [...this.allLocations];
      this.computeOptionLists();
    } catch (error: any) {
      this.alertService?.showAlert?.('Internal Error', error?.message || 'Failed to load locations', 'error');
      this.allLocations = [];
      this.filteredLocations = [];
      this.cityOptions = [];
      this.typeOptions = [];
      this.specOptions = [];
      this.amenityOptions = [];
    } finally {
      this.isLoading = false;
    }
  }

  onSearchChange(term: any): void {
    this.searchTerm = (term ?? '').toString();
    this.applyFilters();
  }

  onCityChange(value: string): void {
    this.selectedCity = value || '';
    this.applyFilters();
  }

  onCapacityChange(value: 'all' | 'under100' | '100-300' | 'over300'): void {
    this.selectedCapacity = value || 'all';
    this.applyFilters();
  }

  onTypeChange(value: string): void {
    this.selectedType = value || '';
    this.applyFilters();
  }

  onSpecChange(value: string): void {
    this.selectedSpec = value || '';
    this.applyFilters();
  }

  onAmenityChange(value: string): void {
    this.selectedAmenity = value || '';
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCity = '';
    this.selectedCapacity = 'all';
    this.selectedType = '';
    this.selectedSpec = '';
    this.selectedAmenity = '';
    this.filteredLocations = [...this.allLocations];
  }

  goToLocationDetail(id: any): void {
    this.router.navigate(['locations', id]);
  }

  private applyFilters(): void {
    const search = (this.searchTerm || '').trim().toLowerCase();
    const cityLc = (this.selectedCity || '').toLowerCase();
    const typeLc = (this.selectedType || '').toLowerCase();
    const specLc = (this.selectedSpec || '').toLowerCase();
    const amenityLc = (this.selectedAmenity || '').toLowerCase();

    this.filteredLocations = this.allLocations.filter((loc: any) => {
      const name = (loc?.location || loc?.name || '').toString().toLowerCase();
      const matchesSearch = search.length === 0 ? true : name.includes(search);

      const city = (loc?.city || loc?.location_city || '').toString().toLowerCase();
      const matchesCity = cityLc.length === 0 ? true : city === cityLc;

      const typeStr = (loc?.type || loc?.residence_type || '').toString().toLowerCase();
      const typesArr = Array.isArray(loc?.types) ? loc.types : [];
      const typesNames = typesArr.map((t: any) => ((t?.type || t?.name || '').toString().toLowerCase()));
      const matchesType = typeLc.length === 0 ? true : (typeStr === typeLc || typesNames.includes(typeLc));

      const specsArr = Array.isArray(loc?.specs) ? loc.specs : [];
      const specNames = specsArr.map((s: any) => ((s?.specs || s?.spec || s?.name || '').toString().toLowerCase()));
      const matchesSpec = specLc.length === 0 ? true : specNames.includes(specLc);

      const amenArr = Array.isArray(loc?.amenity) ? loc.amenity : (Array.isArray(loc?.amenities) ? loc.amenities : []);
      const amenNames = amenArr.map((a: any) => ((a?.name || a?.amenity || '').toString().toLowerCase()));
      const matchesAmenity = amenityLc.length === 0 ? true : amenNames.includes(amenityLc);

      const capacityVal = Number(loc?.capacity || loc?.max_capacity || 0);
      const matchesCapacity = this.capacityMatches(capacityVal, this.selectedCapacity);

      return matchesSearch && matchesCity && matchesType && matchesSpec && matchesAmenity && matchesCapacity;
    });
  }

  private capacityMatches(value: number, filter: 'all' | 'under100' | '100-300' | 'over300'): boolean {
    if (!value || isNaN(value)) return filter === 'all';
    switch (filter) {
      case 'under100':
        return value < 100;
      case '100-300':
        return value >= 100 && value <= 300;
      case 'over300':
        return value > 300;
      case 'all':
      default:
        return true;
    }
  }

  private computeOptionLists(): void {
    const citySet = new Set<string>();
    const typeSet = new Set<string>();
    const specSet = new Set<string>();
    const amenitySet = new Set<string>();

    for (const loc of this.allLocations) {
      const city = (loc?.city || loc?.location_city || '').toString().trim();
      if (city) citySet.add(city);

      const typeStr = (loc?.type || loc?.residence_type || '').toString().trim();
      if (typeStr) typeSet.add(typeStr);

      const typesArr = Array.isArray(loc?.types) ? loc.types : [];
      for (const t of typesArr) {
        const n = (t?.name || t?.type || '').toString().trim();
        if (n) typeSet.add(n);
      }

      const specsArr = Array.isArray(loc?.specs) ? loc.specs : [];
      for (const s of specsArr) {
        const n = (s?.name || s?.spec || s?.specs || '').toString().trim();
        if (n) specSet.add(n);
      }

      const amenArr = Array.isArray(loc?.amenity) ? loc.amenity : (Array.isArray(loc?.amenities) ? loc.amenities : []);
      for (const a of amenArr) {
        const n = (a?.name || a?.amenity || '').toString().trim();
        if (n) amenitySet.add(n);
      }
    }

    this.cityOptions = Array.from(citySet).sort((a, b) => a.localeCompare(b));
    this.typeOptions = Array.from(typeSet).sort((a, b) => a.localeCompare(b));
    this.specOptions = Array.from(specSet).sort((a, b) => a.localeCompare(b));
    this.amenityOptions = Array.from(amenitySet).sort((a, b) => a.localeCompare(b));
  }
}
