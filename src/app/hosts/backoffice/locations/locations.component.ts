import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationService } from '../../../services/location.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-locations',
  imports: [CommonModule],
  templateUrl: './locations.component.html',
  standalone: true,
})
export class LocationsComponent implements OnInit {
  locations: any[] = [];
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(private locationService: LocationService, private router: Router) {}

  ngOnInit(): void {
    this.loadLocations();
    this.getLocationInfo(2);
  }

  async loadLocations(): Promise<void> {
    this.loading = true;
    this.errorMessage = null;
    try {
      const rows = await this.locationService.getallLocation();
      this.locations = Array.isArray(rows) ? rows : [];
    } catch (err: any) {
      this.errorMessage = err?.message || 'Failed to load locations';
    } finally {
      this.loading = false;
    }
  }

  getStatusLabel(status: any): string {
    return +status === 1 ? 'Active' : 'Inactive';
  }

  createNew(): void {
    this.router.navigate(['hosts/console/locations/create']);
  }

  async getLocationInfo(id:any){
    let row =await this.locationService.getLocationInfo(2)
  }

  navigateTo(id: any): void {
    this.router.navigate([`hosts/console/locations/${id}`]);
  }


}
