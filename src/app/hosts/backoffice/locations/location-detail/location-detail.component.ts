import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LocationService } from '../../../../services/location.service';
import { AlertService } from '../../../../services/alert.service';

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DatePipe],
  templateUrl: './location-detail.component.html'
})
export class LocationDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService,
    private alertService: AlertService
  ) {}

  loading: boolean = true;
  error: string | null = null;
  locationId: string | null = null;
  location: any = null;

  async ngOnInit(): Promise<void> {
    try {
      this.locationId = this.route.snapshot.paramMap.get('id');
      if (!this.locationId) {
        this.error = 'Location ID not found';
        this.loading = false;
        return;
      }

      const rows = await this.locationService.getLocationInfo(this.locationId);
      this.location = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      if (!this.location) {
        this.error = 'Location not found';
      } else {
        const v: any = (this.location as any).is_active ?? (this.location as any).status;
        (this.location as any).is_active = v === true || v === 1 || v === '1';
      }
    } catch (err: any) {
      this.error = err?.message || 'Failed to load location';
    } finally {
      this.loading = false;
    }
  }

  editDetails(): void {
    this.router.navigate(['hosts/console/locations/create'], { queryParams: { id: this.location?.id }, state: { id: this.location?.id } });
  }

  async toggleStatus(): Promise<void> {
    if (!this.location) return;
    const currentActive = (this.location as any).is_active === true || (this.location as any).is_active === 1 || (this.location as any).is_active === '1';
    const newActive = !currentActive;
    try {
      const result = await this.locationService.updateLocationStatus(this.location.id, newActive);
      if (result) {
        (this.location as any).is_active = newActive;
        this.alertService.showAlert(
          'Success',
          `Location status updated to ${newActive ? 'Active' : 'Inactive'}.`,
          'success'
        );
      } else {
        this.alertService.showAlert(
          'Warning',
          'Status update returned no data. Please refresh the page.',
          'warning'
        );
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      this.alertService.showAlert(
        'Error',
        err?.message || 'Failed to update location status',
        'error'
      );
    }
  }

  async deleteLocation(): Promise<void> {
    // if (!this.location) return;
    // const sure = confirm('Are you sure you want to delete this location? This cannot be undone.');
    // if (!sure) return;




    
    // try {
    //   await this.locationService.deleteLocationAndAssets(this.location.id);
    //   this.router.navigate(['hosts/console/locations']);
    // } catch (err) {
    //   console.error(err);
    // }

    this.alertService.dialogAlert('Are you sure you want to delete this location?', 'Delete', 'Cancel').then((res:any)=>{
      if(res.isConfirmed){
        this.locationService.deleteLocationAndAssets(this.location.id).then(()=>{
          this.router.navigate(['hosts/console/locations']);
        })
      }else{
        this.alertService.showAlert('Cancelled', 'Location not deleted', 'warning');
      }
    })


  }

  stripHtml(html: string | null | undefined): string {
    if (!html) return '—';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '—';
  }
}


