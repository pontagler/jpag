import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterModule],
  templateUrl: './detail.component.html'
})
export class LocationDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private locationService: LocationService
  ) {}

  loading: boolean = true;
  error: string | null = null;
  locationId: string | null = null;
  location: any = null;
  isMenuOpen: boolean = false;
  currentImageIndex: number = 0;
  currentYear: number = new Date().getFullYear();

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
      }
    } catch (err: any) {
      this.error = err?.message || 'Failed to load location';
    } finally {
      this.loading = false;
    }
  }

  backToList(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  get galleryImages(): { url: string }[] {
    const imgs = Array.isArray(this.location?.images) ? this.location.images : [];
    return imgs.map((i: any) => ({ url: i?.url || '' })).filter((x: any) => !!x.url);
  }

  showPrev(): void {
    const n = this.galleryImages.length;
    if (n === 0) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + n) % n;
  }

  showNext(): void {
    const n = this.galleryImages.length;
    if (n === 0) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % n;
  }

  goArtistLogin(): void {
    this.router.navigate(['/artistspace']);
  }
}
