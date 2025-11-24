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

eventArray:any = [];
expandedEvents: boolean[] = [];
limitedEvents: any[] = [];

newsletter: { name: string; phone: string; email: string } = { name: '', phone: '', email: '' };
isSubmitting: boolean = false;

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
    const arr = Array.isArray(res) ? res : [];
    this.eventArray = arr.map((raw: any) => this.normalizeHomeEvent(raw));
    this.expandedEvents = new Array(this.eventArray?.length || 0).fill(false);
    this.limitedEvents = this.eventArray.slice(0, 4);
  })
}catch(error:any){
this.alertService.showAlert('Internal Error', error.message, 'error');
}

}
  toggleDates(index: number): void {
    this.expandedEvents[index] = !this.expandedEvents[index];
  }

  getVisibleDates(event: any, index: number): EventDateItem[] {
    const dates: EventDateItem[] = Array.isArray(event?.event_dates) ? event.event_dates : [];
    if (!dates.length) return [];
    return this.expandedEvents[index] ? dates : dates.slice(0, 2);
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

artistArray:any = [];
  
async getFeaturedArtist(){

try{
  this.visitorService.getFeaturedArtist().then((res)=>{
    this.artistArray = res;
  })
}catch(error:any){
this.alertService.showAlert('Internal Error', error.message, 'error');
}

}
 
  trackByArtistId(index: number, artist: any): number | string {
    return artist?.id_artist ?? index;
  }

  isShowPast(d: EventDateItem): boolean {
    if (!d?.date) return false;
    const datePart = new Date(d.date);
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
    const eventDates: EventDateItem[] = Array.isArray(raw?.event_dates) ? raw.event_dates : [];
    const location = eventDates.length > 0 ? (eventDates[0] as any)?.location || '' : '';
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
      editionDisplay
    };
  }

}

