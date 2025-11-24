import { Component } from '@angular/core';
import { VisitorService } from '../../../services/visitor.service';
import { AlertService } from '../../../services/alert.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { StripHtmlPipe } from '../../../shared/strip-html.pipe';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, TitleCasePipe, RouterModule, StripHtmlPipe],
  templateUrl: './detail.component.html'
})
export class DetailComponent {

  constructor(
    private visitorService: VisitorService,
    private alertService: AlertService,
    private route: ActivatedRoute,
   
  ){

  }
artist:any = {};
id_artist:any;
bg:any = 'https://pekaexfrnhysdntbyqbl.supabase.co/storage/v1/object/public/artistrequest/istockphoto-821760914-612x612.jpg';
 isLoading: boolean = true;
  ngOnInit(): void {
    this.id_artist = Number(this.route.snapshot.params['id']);
    this.getArtistProfile();

  }

  async getArtistProfile(){
    this.isLoading = true;
    try{
      const data = await this.visitorService.getArtistProfile(this.id_artist);
      const raw = data && data.length > 0 ? data[0] : {};
      // normalize optional arrays to arrays to simplify template logic
      this.artist = {
        ...raw,
        instruments: Array.isArray(raw?.instruments) ? raw.instruments : [],
        performance_type: Array.isArray(raw?.performance_type) ? raw.performance_type : [],
        education: Array.isArray(raw?.education) ? raw.education : [],
        awards: Array.isArray(raw?.awards) ? raw.awards : [],
        media: Array.isArray(raw?.media) ? raw.media : [],
        upcoming_event: this.mergeUpcomingEvents(Array.isArray(raw?.upcoming_event) ? raw.upcoming_event : [])
      };
    }catch(error:any){
      this.alertService.showAlert('Internal Error', error?.message || 'Unknown error', 'error');
      this.artist = {};
    } finally {
      this.isLoading = false;
    }

  }

openInNewTab(url:any) {
  const newTab = window.open(url, '_blank');
  if (newTab) {
    newTab.focus();
  }
}


  private parseDate(value: any): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  private formatDate(d: Date): string {
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private formatTimeString(time: string | null | undefined): string {
    if (!time) return '';
    const d = new Date(`1970-01-01T${time}`);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private getLocationName(e: any): string {
    return (e?.location?.name || e?.location || e?.venue || '').toString().trim();
  }

  private getEventKey(e: any): string {
    const id = (e?.id ?? e?.id_event ?? e?.event_id ?? '').toString();
    if (id) return id;
    const title = (e?.title || e?.name || '').toString().trim().toLowerCase();
    const loc = this.getLocationName(e).toLowerCase();
    return `${title}|${loc}`;
  }

  private mergeUpcomingEvents(list: any[]): any[] {
    if (!Array.isArray(list) || list.length === 0) return [];
    const groups = new Map<string, any[]>();
    for (const ev of list) {
      const key = this.getEventKey(ev);
      const arr = groups.get(key) || [];
      arr.push(ev);
      groups.set(key, arr);
    }

    const merged: any[] = [];
    for (const [, items] of groups.entries()) {
      items.sort((a, b) => {
        const da = this.parseDate(a?.start_date || a?.date || a?.start) as any;
        const db = this.parseDate(b?.start_date || b?.date || b?.start) as any;
        return (da?.getTime?.() || 0) - (db?.getTime?.() || 0);
      });

      const first = items[0] || {};
      const title = first?.title || first?.name || 'Show';
      const location = this.getLocationName(first);
      const url = first?.url || first?.booking_url || null;

      const allStartDates: Date[] = [];
      const allEndDates: Date[] = [];
      const allStartTimes: string[] = [];
      const allEndTimes: string[] = [];

      for (const ev of items) {
        const sd = this.parseDate(ev?.start_date || ev?.date || ev?.start);
        const ed = this.parseDate(ev?.end_date || ev?.end || ev?.date);
        if (sd) allStartDates.push(sd);
        if (ed) allEndDates.push(ed);
        if (ev?.start_time) allStartTimes.push(ev.start_time);
        if (ev?.end_time) allEndTimes.push(ev.end_time);
      }

      const minStart = allStartDates.length ? new Date(Math.min(...allStartDates.map(d => d.getTime()))) : null;
      const maxEnd = (allEndDates.length ? new Date(Math.max(...allEndDates.map(d => d.getTime()))) : null) || minStart;

      let dateText = '';
      if (minStart && maxEnd) {
        const sameDay = minStart.toDateString() === maxEnd.toDateString();
        dateText = sameDay
          ? this.formatDate(minStart)
          : `${this.formatDate(minStart)} - ${this.formatDate(maxEnd)}`;
      } else if (minStart) {
        dateText = this.formatDate(minStart);
      }

      let timeText = '';
      if (allStartTimes.length || allEndTimes.length) {
        const earliestStart = allStartTimes.length
          ? allStartTimes.sort()[0]
          : '';
        const latestEnd = allEndTimes.length
          ? allEndTimes.sort()[allEndTimes.length - 1]
          : '';
        const startFmt = this.formatTimeString(earliestStart);
        const endFmt = this.formatTimeString(latestEnd);
        if (startFmt && endFmt) timeText = `${startFmt} - ${endFmt}`;
        else if (startFmt) timeText = startFmt;
        else if (endFmt) timeText = endFmt;
      }

      merged.push({
        ...first,
        id: (first?.id ?? first?.id_event ?? first?.event_id ?? null),
        title,
        location,
        url,
        id_location: (first?.id_location ?? first?.location_id ?? null),
        start_date: minStart ? minStart.toISOString() : first?.start_date,
        end_date: maxEnd ? maxEnd.toISOString() : first?.end_date,
        dateText,
        timeText
      });
    }

    return merged;
  }

}
