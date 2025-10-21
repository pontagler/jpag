import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { SafeUrlPipe } from '../../../shared/safe-url.pipe';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detail.component.html'
})
export class DetailComponent implements OnInit {
  isLoading: boolean = true;
  errorMessage: string = '';
  event: any = null;
  currentYear: number = new Date().getFullYear();
  activeTab: 'details' | 'location' | 'artists' | 'media' = 'details';
  showAllDates: boolean = false;
  showFullTeaser: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) {}

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (id === null || Number.isNaN(id)) {
      this.errorMessage = 'Invalid event id';
      this.isLoading = false;
      return;
    }
    await this.loadEvent(id);
  }

  private async loadEvent(id: number): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const data = await this.eventService.getEventDetail(id as any);
      const raw = Array.isArray(data) ? (data[0] || null) : (data || null);
      if (!raw) {
        this.errorMessage = 'Event not found.';
        this.event = null;
        return;
      }
      this.event = this.normalizeEvent(raw);
    } catch (err) {
      this.errorMessage = 'Failed to load event.';
      this.event = null;
    } finally {
      this.isLoading = false;
    }
  }

  get displayedDates(): any[] {
    const dates = Array.isArray(this.event?.dates) ? this.event.dates : [];
    return this.showAllDates ? dates : dates.slice(0, 2);
  }

  get hasMoreDates(): boolean {
    const dates = Array.isArray(this.event?.dates) ? this.event.dates : [];
    return dates.length > 2;
  }

  toggleDates(): void {
    this.showAllDates = !this.showAllDates;
  }

  toggleTeaser(): void {
    this.showFullTeaser = !this.showFullTeaser;
  }

  isDateTimePast(d: { date?: string | Date; time?: string | null }): boolean {
    if (!d || !d.date) return false;
    const base = new Date(d.date);
    if (isNaN(base.getTime())) return false;
    if (d.time) {
      const [h, m] = String(d.time).split(':');
      const hours = Number(h);
      const minutes = Number(m);
      if (!Number.isNaN(hours)) base.setHours(hours);
      if (!Number.isNaN(minutes)) base.setMinutes(minutes);
      base.setSeconds(0, 0);
    }
    return base.getTime() < Date.now();
  }

  private normalizeEvent(raw: any): any {
    const eventDates = Array.isArray(raw?.event_dates) ? raw.event_dates : [];
    const shows = Array.isArray(raw?.event_shows) ? raw.event_shows : [];
    const artists = Array.isArray(raw?.event_artists) ? raw.event_artists : [];
    const media = Array.isArray(raw?.event_media) ? raw.event_media : [];
    const instruments = Array.isArray(raw?.instruments)
      ? raw.instruments
      : (Array.isArray(raw?.event_instruments) ? raw.event_instruments : []);

    const artistDisplay = artists
      .map((a: any) => `${(a?.fname || '').trim()} ${(a?.lname || '').trim()}`.trim())
      .filter((s: string) => !!s)
      .join(', ');

    const editionDisplay = (raw?.edition && String(raw.edition).trim().length > 0)
      ? raw.edition
      : [raw?.edition_name, raw?.edition_year]
          .filter((v: any) => !!v)
          .join(' ');

    const statusNormalized: 'upcoming' | 'past' | '' = typeof raw?.status === 'number'
      ? (raw.status === 1 ? 'upcoming' : raw.status === 0 ? 'past' : '')
      : (
          (raw?.is_active === true && 'upcoming')
          || (raw?.is_completed === true && 'past')
          || (((raw?.status || '') as string).toString().toLowerCase() as any)
        );

    return {
      id: raw?.id ?? raw?.id_event ?? null,
      host: raw?.host || '',
      eventKind: raw?.event || '',
      imageUrl: raw?.photo || '',
      creditPhoto: raw?.credit_photo || '',
      title: raw?.title || '',
      status: statusNormalized,
      teaser: raw?.teaser || '',
      programme: raw?.programme || '',
      eventType: raw?.event_type || raw?.event_domain || raw?.event || '',
      description: raw?.description || '',
      bookingUrl: raw?.booking_url || '',
      editionDisplay,
      dates: eventDates.map((d: any) => ({
        id: d?.id,
        date: d?.date,
        time: d?.time,
        location: d?.location || '',
        id_location: d?.id_location ?? d?.location_id ?? null
      })),
      shows: shows.map((s: any) => ({
        id: s?.id,
        composer: s?.title,
        piece: s?.description,
        duration: s?.time_manage
      })),
      instruments: instruments
        .map((i: any) => (i?.instrument || i?.name))
        .filter((v: any) => !!v),
      location: {
        name: raw?.location?.name || (Array.isArray(eventDates) && eventDates[0]?.location) || '',
        address: raw?.location?.address || '',
        city: raw?.location?.city || '',
        country: raw?.location?.country || '',
        zip: raw?.location?.zip || '',
        email: raw?.location?.email || '',
        phone: raw?.location?.phone || '',
        website: raw?.location?.website || '',
        capacity: raw?.location?.capacity || '',
        description: raw?.location?.description || ''
      },
      artists: artists.map((a: any) => ({
        id: (a?.id ?? a?.id_artist ?? a?.artist_id ?? a?.id_user ?? a?.user_id ?? null),
        name: (
          `${(a?.fname || '').trim()} ${(a?.lname || '').trim()}`.trim()
          || (a?.artist || '').trim()
        ),
        photo: a?.photo || '',
        tagline: a?.tagline || a?.teaser || '',
        short_bio: a?.short_bio || ''
      })),

    media: media.map((a: any) => ({
        id: a?.id,
        url: a?.url || '',
        image: a?.image || '',
        title: a?.title || '',
        description: a?.description || '',
      })),



    };
  }

  formatDate(dateString: string | Date | null | undefined): string {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatTime(timeString: string | null | undefined): string {
    if (!timeString) return '';
    // Ensure we can format time-only strings by anchoring to a date
    const d = new Date(`1970-01-01T${timeString}`);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}
