import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { EventService } from '../../../../services/event.service';
import { CommonModule } from '@angular/common';
import { StripHtmlPipe } from '../../../../shared/strip-html.pipe';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, StripHtmlPipe],
  templateUrl: './event-detail.component.html'
})
export class EventDetailComponent implements OnInit {
  isLoading: boolean = true;
  errorMessage: string = '';
  event: any = null;
  currentYear: number = new Date().getFullYear();
  // Mirror create-event steps: 1 Detail, 2 Dates, 4 Image, 5 Media, 6 Artists (Step 3 removed - no event_shows table)
  step: 1 | 2 | 4 | 5 | 6 = 1;

  showAllDates: boolean = false;
  media: Array<{ id: number; id_media_type: number; title: string; image: string | null; description: string | null; url: string | null }> = [];

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
    await Promise.all([this.loadEvent(id), this.loadMedia(id)]);
  }

  get displayedDates(): any[] {
    if (this.event?.isPeriod) {
      const periods = Array.isArray(this.event?.period) ? this.event.period : [];
      return this.showAllDates ? periods : periods.slice(0, 2);
    } else {
      const dates = Array.isArray(this.event?.dates) ? this.event.dates : [];
      return this.showAllDates ? dates : dates.slice(0, 2);
    }
  }

  get hasMoreDates(): boolean {
    if (this.event?.isPeriod) {
      const periods = Array.isArray(this.event?.period) ? this.event.period : [];
      return periods.length > 2;
    } else {
      const dates = Array.isArray(this.event?.dates) ? this.event.dates : [];
      return dates.length > 2;
    }
  }

  toggleDates(): void {
    this.showAllDates = !this.showAllDates;
  }

  private async loadEvent(id: number): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const data = await this.eventService.getEventDetailHost(id as any);
      console.log('data--->', data);
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

  private async loadMedia(id: number): Promise<void> {
    try {
      const data = await this.eventService.getEventMedia(id);
      this.media = (data || []).map((m: any) => ({
        id: m.id,
        id_media_type: m.id_media_type,
        title: m.title,
        image: m.image,
        description: m.description,
        url: m.url
      }));
    } catch (err) {
      // ignore media errors; keep page loading
      this.media = [];
    }
  }

  private normalizeEvent(raw: any): any {
    const eventDates = Array.isArray(raw?.event_dates) ? raw.event_dates : [];
    const shows = Array.isArray(raw?.event_shows) ? raw.event_shows : [];
    const artists = Array.isArray(raw?.event_artists) ? raw.event_artists : [];
    const instruments = Array.isArray(raw?.event_instruments) ? raw.event_instruments : [];
    const period = Array.isArray(raw?.period) ? raw.period : [];

    const editionDisplay = raw?.edition || '';

    return {
      id: raw?.id ?? raw?.id_event ?? null,
      host: raw?.host || '',
      eventKind: raw?.event || '',
      imageUrl: raw?.photo || '',
      title: raw?.title || '',
      status: raw?.status,
      teaser: raw?.teaser || '',
      programme: raw?.programme || '',
      eventType: raw?.event_type || '',
      description: raw?.description || '',
      bookingUrl: raw?.booking_url || '',
      isPeriod: raw?.is_period || false,
      editionDisplay,
      dates: eventDates.map((d: any) => ({ 
        id: d?.id, 
        date: d?.date, 
        time: d?.time,
        location: d?.location,
        id_location: d?.id_location
      })),
      period: period.map((p: any) => ({
        start_date: p?.start_date,
        end_date: p?.end_date,
        time: p?.time,
        location: p?.location,
        id_location: p?.id_location
      })),
      shows: shows.map((s: any) => ({ id: s?.id, composer: s?.title, piece: s?.description, duration: s?.time_manage })),
      instruments: instruments.map((i: any) => i?.instrument).filter((v: any) => !!v),
      location: {
        name: raw?.location?.name || '',
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
        name: a?.artist || `${(a?.fname || '').trim()} ${(a?.lname || '').trim()}`.trim(),
        photo: a?.photo || '',
        tagline: a?.teaser || a?.tagline || '',
        shortBio: a?.short_bio || ''
      }))
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
    const d = new Date(`1970-01-01T${timeString}`);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatPeriodDate(
    startDate: string | Date | null | undefined,
    endDate: string | Date | null | undefined
  ): string {
    const start = this.formatDate(startDate);
    const end = this.formatDate(endDate);
    if (start && end) {
      return `${start} - ${end}`;
    }
    return start || end || '';
  }
}
