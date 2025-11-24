import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocationService } from '../../../services/location.service';
import { SafeUrlPipe } from '../../../shared/safe-url.pipe';
import { StripHtmlPipe } from '../../../shared/strip-html.pipe';

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterModule, SafeUrlPipe, StripHtmlPipe],
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

  // Computed helpers for contact fallback logic
  get hasLocationContact(): boolean {
    const loc = this.location || {};
    return Boolean(loc.phone || loc.email || loc.website);
  }

  get showHostContact(): boolean {
    const loc = this.location || {};
    const hasHostContact = Boolean(loc.host_phone || loc.host_email);
    return !this.hasLocationContact && hasHostContact;
  }

  get hostName(): string {
    const loc = this.location || {};
    return (loc.host || loc.host_name || 'Pontangler') as string;
  }

  get hostPhone(): string {
    const loc = this.location || {};
    return (loc.host_phone || '') as string;
  }

  get hostEmail(): string {
    const loc = this.location || {};
    return (loc.host_email || '') as string;
  }

  // Coordinates and map helpers
  private parseNumber(value: any): number | null {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  get latValue(): number | null {
    const loc = this.location || {};
    return this.parseNumber(loc.lat ?? loc.latitude);
  }

  get lngValue(): number | null {
    const loc = this.location || {};
    return this.parseNumber(loc.long ?? loc.lng ?? loc.longitude);
  }

  get hasCoordinates(): boolean {
    return this.latValue !== null && this.lngValue !== null;
  }

  get mapEmbedUrl(): string {
    if (!this.hasCoordinates) return '';
    const lat = this.latValue as number;
    const lng = this.lngValue as number;
    const zoom = 15;
    return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  }
}
