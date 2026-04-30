import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { VisitorService } from '../../services/visitor.service';
import { StripHtmlPipe } from '../../shared/strip-html.pipe';

interface EventDateItem {
  date: string | Date | null | undefined;
  time: string | null | undefined;
  location?: string | null | undefined;
  flag?: string | null | undefined;
  end_date?: string | Date | null | undefined;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StripHtmlPipe],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private alertService:AlertService, private visitorService:VisitorService) {}

ngOnInit(): void {
  this.getUpcomingEvents();
  this.visitorService.setRouteID(1);
  this.getFeaturedArtist();
}

  goToEvents(): void {
    this.router.navigate(['events']);
  }

  goToArtists(): void {
    this.router.navigate(['artists']);
  }

private readonly festivalEditionTypeId = 1;

eventArray:any = [];
expandedEvents: boolean[] = [];
festivalUpcomingEvents: any[] = [];

newsletter: { name: string; phone: string; email: string } = { name: '', phone: '', email: '' };
isSubmitting: boolean = false;
artistArray:any = [];
private upcomingEventArtists: any[] = [];
private featuredArtists: any[] = [];

goYoutube(){
  window.open('https://www.youtube.com/watch?v=wTH9TkJVHQY', '_blank');
}

becomeMember(){
  window.open('https://www.helloasso.com/associations/les-journees-de-pont-ar-gler/adhesions/adherez-a-l-association', '_blank');
}


donation(){
  window.open('https://www.helloasso.com/beta/associations/les-journees-de-pont-ar-gler/formulaires/7', '_blank');
}

async getUpcomingEvents(){

try{
  this.visitorService.getUpcomingEvents().then((res)=>{
    console.log('Raw API response:', res);
    const arr = Array.isArray(res) ? res : [];
    this.eventArray = arr
      .filter((raw: any) => this.isFestivalEdition(raw))
      .map((raw: any) => this.normalizeHomeEvent(raw));
    console.log('Normalized eventArray:', this.eventArray);
    this.expandedEvents = new Array(this.eventArray?.length || 0).fill(false);
    this.festivalUpcomingEvents = this.eventArray;
    this.upcomingEventArtists = this.getArtistsFromUpcomingEvents(this.eventArray);
    this.updateArtistArray();
    console.log('Festival upcoming events:', this.festivalUpcomingEvents);
  })
}catch(error:any){
this.alertService.showAlert('Internal Error', error.message, 'error');
}

}
  toggleDates(index: number): void {
    this.expandedEvents[index] = !this.expandedEvents[index];
  }

  getVisibleDates(event: any, index: number): any[] {
    console.log('getVisibleDates for event:', event.id, 'isPeriod:', event?.isPeriod);
    if (event?.isPeriod) {
      const periods = Array.isArray(event?.period) ? event.period : [];
      console.log('Periods array:', periods);
      if (!periods.length) return [];
      return this.expandedEvents[index] ? periods : periods.slice(0, 2);
    } else {
      const dates = Array.isArray(event?.dates) ? event.dates : [];
      console.log('Dates array:', dates);
      if (!dates.length) return [];
      return this.expandedEvents[index] ? dates : dates.slice(0, 2);
    }
  }

  getTotalDatesCount(event: any): number {
    if (event?.isPeriod) {
      return Array.isArray(event?.period) ? event.period.length : 0;
    } else {
      return Array.isArray(event?.dates) ? event.dates.length : 0;
    }
  }

  formatPeriodDate(startDate: string | Date | null | undefined, endDate: string | Date | null | undefined): string {
    if (!startDate) return '';
    const start = this.formatDate(startDate);
    if (!endDate) return start;
    const end = this.formatDate(endDate);
    return `${start} - ${end}`;
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

async getFeaturedArtist(){

try{
  this.visitorService.getFeaturedArtist().then((res)=>{
    const arr = Array.isArray(res) ? res : [];
    this.featuredArtists = arr.map((artist: any) => this.normalizeArtistForHome(artist));
    this.updateArtistArray();
  })
}catch(error:any){
this.alertService.showAlert('Internal Error', error.message, 'error');
}

}
 
  trackByArtistId(index: number, artist: any): number | string {
    const nameKey = `${artist?.fname || ''}-${artist?.lname || ''}`.trim();
    return artist?.id_artist ?? (nameKey || index);
  }

  isShowPast(d: any): boolean {
    // Handle both date objects and period objects
    const dateToCheck = d?.date || d?.start_date;
    if (!dateToCheck) return false;
    const datePart = new Date(dateToCheck);
    if (isNaN(datePart.getTime())) return false;
    let combined = new Date(datePart);
    if (d.time) {
      const [hoursStr, minutesStr] = String(d.time).split(':');
      const hours = Number(hoursStr ?? 0);
      const minutes = Number(minutesStr ?? 0);
      combined.setHours(hours, minutes, 0, 0);
    }
    return combined.getTime() < Date.now();
  }

  async submitNewsletter(): Promise<void> {
    const email = (this.newsletter.email || '').trim();
    if (!email) {
      this.alertService.showAlert('Validation', 'Email is required', 'warning');
      return;
    }
    try {
      this.isSubmitting = true;
      await this.visitorService.subscribeNewsletter({
        name: this.newsletter.name,
        phone: this.newsletter.phone,
        email: email
      });
      this.alertService.showAlert('Thank you!', 'You are subscribed to our newsletter.', 'success');
      this.newsletter = { name: '', phone: '', email: '' };
    } catch (error: any) {
      this.alertService.showAlert('Subscription failed', error?.message || 'Please try again later.', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  private normalizeHomeEvent(raw: any): any {
    // Handle new event_dates structure: { dates: [], period: [], is_period: boolean }
    const eventDatesObj = raw?.event_dates || {};
    console.log('Event dates object:', eventDatesObj);
    const isPeriod = eventDatesObj.is_period || false;
    const dates = Array.isArray(eventDatesObj.dates) ? eventDatesObj.dates : [];
    const period = Array.isArray(eventDatesObj.period) ? eventDatesObj.period : [];
    console.log('isPeriod:', isPeriod, 'dates:', dates, 'period:', period);
    
    // Get location from first date or period entry
    let location = '';
    if (isPeriod && period.length > 0) {
      location = period[0]?.location || '';
    } else if (dates.length > 0) {
      location = dates[0]?.location || '';
    }
    
    const instruments = Array.isArray(raw?.event_instruments)
      ? raw.event_instruments.map((i: any) => ({ instrument: i?.name || '' })).filter((x: any) => !!x.instrument)
      : [];
    const artistDisplay = Array.isArray(raw?.event_artists)
      ? (() => {
          const names: string[] = raw.event_artists
            .map((a: any) => (a?.artist ?? `${(a?.fname || '').trim()} ${(a?.lname || '').trim()}`.trim()))
            .filter((s: string) => !!s);
          if (names.length === 0) return '';
          if (names.length === 1) return names[0];
          if (names.length === 2) return `${names[0]} & ${names[1]}`;
          return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
        })()
      : '';
    const editionDisplay = (raw?.edition && String(raw.edition))
      ? String(raw.edition)
      : [raw?.edition_name, raw?.edition_year].filter((v: any) => !!v).join(' ');
    return {
      ...raw,
      id: raw?.id ?? raw?.id_event ?? null,
      location,
      instruments,
      artistDisplay,
      editionDisplay,
      isPeriod,
      dates,
      period
    };
  }

  private isFestivalEdition(raw: any): boolean {
    const editionTypeIds = [
      raw?.id_edition_type,
      raw?.edition_type_id,
      raw?.id_sys_event_edition,
      raw?.event_edition?.id_edition_type,
      raw?.edition?.id_edition_type,
      raw?.event_edition?.sys_event_edition?.id,
      raw?.sys_event_edition?.id,
      raw?.edition_type?.id
    ].filter((value) => value !== null && value !== undefined && value !== '');

    if (editionTypeIds.length > 0) {
      return editionTypeIds.some((value) => Number(value) === this.festivalEditionTypeId);
    }

    const editionTypeNames = [
      raw?.edition_type,
      raw?.editionType,
      raw?.event_edition?.sys_event_edition?.name,
      raw?.sys_event_edition?.name,
      raw?.edition_type?.name
    ].filter((value) => typeof value === 'string' && value.trim().length > 0);

    if (editionTypeNames.length > 0) {
      return editionTypeNames.some((value) => value.trim().toLowerCase() === 'festival');
    }

    const editionNames = [
      raw?.edition,
      raw?.edition_name,
      raw?.editionDisplay
    ].filter((value) => typeof value === 'string' && value.trim().length > 0);

    return editionNames.some((value) => value.trim().toLowerCase().includes('festival'));
  }

  private getArtistsFromUpcomingEvents(events: any[]): any[] {
    const artists = new Map<string, any>();

    for (const event of events) {
      const eventArtists = Array.isArray(event?.event_artists) ? event.event_artists : [];

      for (const rawArtist of eventArtists) {
        const artist = this.normalizeArtistForHome(rawArtist);
        const key = this.getArtistKey(artist);

        if (!key) continue;

        const existing = artists.get(key);
        artists.set(key, existing ? this.mergeArtistForHome(existing, artist) : artist);
      }
    }

    return Array.from(artists.values());
  }

  private updateArtistArray(): void {
    const artists = new Map<string, any>();

    for (const artist of [...this.upcomingEventArtists, ...this.featuredArtists]) {
      const normalizedArtist = this.normalizeArtistForHome(artist);
      const key = this.getArtistKey(normalizedArtist);

      if (!key) continue;

      const existing = artists.get(key);
      artists.set(key, existing ? this.mergeArtistForHome(existing, normalizedArtist) : normalizedArtist);
    }

    this.artistArray = Array.from(artists.values()).filter((artist: any) => this.hasArtistPhoto(artist));
  }

  private normalizeArtistForHome(raw: any): any {
    const fullName = (
      raw?.artist
      || raw?.name
      || raw?.full_name
      || `${(raw?.fname || raw?.first_name || '').trim()} ${(raw?.lname || raw?.last_name || '').trim()}`.trim()
    ).toString().trim();
    const nameParts = this.splitArtistName(fullName);
    const fname = (raw?.fname || raw?.first_name || nameParts.fname || '').toString().trim();
    const lname = (raw?.lname || raw?.last_name || nameParts.lname || '').toString().trim();

    return {
      ...raw,
      id_artist: raw?.id_artist ?? raw?.artist_id ?? raw?.id ?? raw?.id_user ?? raw?.user_id ?? null,
      fname,
      lname,
      photo: raw?.photo || raw?.image || raw?.avatar || '',
      tagline: raw?.tagline || raw?.teaser || raw?.short_bio || '',
      instruments: this.normalizeArtistInstruments(raw),
      performance: this.normalizeArtistPerformance(raw)
    };
  }

  private splitArtistName(name: string): { fname: string; lname: string } {
    const parts = name.split(/\s+/).filter((part) => part.length > 0);

    if (parts.length <= 1) {
      return { fname: parts[0] || '', lname: '' };
    }

    return {
      fname: parts.slice(0, -1).join(' '),
      lname: parts[parts.length - 1]
    };
  }

  private normalizeArtistInstruments(raw: any): any[] {
    const instruments = Array.isArray(raw?.instruments)
      ? raw.instruments
      : (Array.isArray(raw?.event_instruments) ? raw.event_instruments : []);

    return instruments
      .map((instrument: any, index: number) => ({
        ...instrument,
        id_instrument: instrument?.id_instrument ?? instrument?.id ?? instrument?.instrument_id ?? `instrument-${index}`,
        instrument: instrument?.instrument || instrument?.name || ''
      }))
      .filter((instrument: any) => !!instrument.instrument);
  }

  private normalizeArtistPerformance(raw: any): any[] {
    const performance = Array.isArray(raw?.performance)
      ? raw.performance
      : (Array.isArray(raw?.performances) ? raw.performances : []);

    return performance
      .map((item: any, index: number) => ({
        ...item,
        id_performance: item?.id_performance ?? item?.id ?? item?.performance_id ?? `performance-${index}`,
        performance: item?.performance || item?.name || ''
      }))
      .filter((item: any) => !!item.performance);
  }

  private getArtistKey(artist: any): string {
    const id = artist?.id_artist ?? artist?.artist_id ?? artist?.id;

    if (id !== null && id !== undefined && id !== '') {
      return `id:${id}`;
    }

    const name = `${artist?.fname || ''} ${artist?.lname || ''}`.trim().toLowerCase();
    return name ? `name:${name}` : '';
  }

  private hasArtistPhoto(artist: any): boolean {
    return typeof artist?.photo === 'string' && artist.photo.trim().length > 0;
  }

  private mergeArtistForHome(primary: any, secondary: any): any {
    return {
      ...secondary,
      ...primary,
      photo: primary?.photo || secondary?.photo || '',
      tagline: primary?.tagline || secondary?.tagline || '',
      instruments: this.mergeArtistItems(primary?.instruments, secondary?.instruments, 'id_instrument', 'instrument'),
      performance: this.mergeArtistItems(primary?.performance, secondary?.performance, 'id_performance', 'performance')
    };
  }

  private mergeArtistItems(primaryItems: any[] = [], secondaryItems: any[] = [], idKey: string, labelKey: string): any[] {
    const items = new Map<string, any>();
    const primaryList = Array.isArray(primaryItems) ? primaryItems : [];
    const secondaryList = Array.isArray(secondaryItems) ? secondaryItems : [];

    for (const item of [...primaryList, ...secondaryList]) {
      const label = (item?.[labelKey] || item?.name || '').toString().trim();
      const id = item?.[idKey] ?? item?.id ?? label;
      const key = id !== null && id !== undefined && id !== '' ? `id:${id}` : `label:${label.toLowerCase()}`;

      if (!label || items.has(key)) continue;

      items.set(key, { ...item, [idKey]: id, [labelKey]: label });
    }

    return Array.from(items.values());
  }

}

