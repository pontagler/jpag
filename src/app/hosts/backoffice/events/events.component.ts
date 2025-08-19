import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventService } from '../../../services/event.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  standalone: false
})
export class EventsComponent implements OnInit {
  constructor(
    private router: Router,
    private eventService: EventService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.getAllEvents();
  }

  // UI state
  showFilters: boolean = false;

  // Filters
  searchQuery: string = '';
  programmeFilter: 'All' | string = 'All';
  eventFilter: 'All' | string = 'All';
  eventTypeFilter: 'All' | string = 'All';
  statusFilter: 'All' | 1 | 2 = 'All';
  timelineFilter: 'All' | 'Upcoming' | 'Past' = 'All';

  // Sorting
  sortKey: keyof EventRow = 'earliestDate';
  sortDirection: 'asc' | 'desc' = 'desc';

  events: EventRow[] = [];

  get uniqueProgrammes(): string[] {
    const values = new Set<string>();
    for (const e of this.events) {
      if (e.programme && e.programme.trim().length > 0) values.add(e.programme);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  get uniqueEvents(): string[] {
    const values = new Set<string>();
    for (const e of this.events) {
      if (e.event && e.event.trim().length > 0) values.add(e.event);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  get uniqueEventTypes(): string[] {
    const values = new Set<string>();
    for (const e of this.events) {
      if (e.eventType && e.eventType.trim().length > 0) values.add(e.eventType);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  get displayedEvents(): EventRow[] {
    const now = new Date();
    // Filter
    let result = this.events.filter((e) => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesQuery = q
        ? (
            (e.title && e.title.toLowerCase().includes(q)) ||
            (e.event && e.event.toLowerCase().includes(q)) ||
            (e.artistsJoined && e.artistsJoined.toLowerCase().includes(q)) ||
            (e.instrumentsJoined && e.instrumentsJoined.toLowerCase().includes(q))
          )
        : true;

      const matchesProgramme = this.programmeFilter === 'All' ? true : e.programme === this.programmeFilter;
      const matchesEvent = this.eventFilter === 'All' ? true : e.event === this.eventFilter;
      const matchesEventType = this.eventTypeFilter === 'All' ? true : e.eventType === this.eventTypeFilter;
      const matchesStatus = this.statusFilter === 'All' ? true : e.status === this.statusFilter;

      const hasFutureDate = e.eventDates.some((d) => d.getTime() >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime());
      const allPast = e.eventDates.length > 0 && e.eventDates.every((d) => d.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime());

      const matchesTimeline =
        this.timelineFilter === 'All'
          ? true
          : this.timelineFilter === 'Upcoming'
          ? hasFutureDate
          : allPast;

      return matchesQuery && matchesProgramme && matchesEvent && matchesEventType && matchesStatus && matchesTimeline;
    });

    // Sort
    const key = this.sortKey;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    result.sort((a: EventRow, b: EventRow) => {
      const va = a[key] as any;
      const vb = b[key] as any;

      if (va instanceof Date && vb instanceof Date) {
        return (va.getTime() - vb.getTime()) * dir;
      }

      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir;
      }

      return String(va ?? '').localeCompare(String(vb ?? '')) * dir;
    });

    return result;
  }

  setSort(key: keyof EventRow): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }

  createNew(): void {
    this.router.navigate(['/hosts/console/events/create']);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.programmeFilter = 'All';
    this.eventFilter = 'All';
    this.eventTypeFilter = 'All';
    this.statusFilter = 'All';
    this.timelineFilter = 'All';
  }

  navigateTo(id: any): void {
    this.router.navigate([`hosts/console/events/${id}`]);
  }

  async getAllEvents() {
    try {
      const res = await this.eventService.getEventsList();
      this.events = (res || []).map((row: any) => {
        const dates: Date[] = Array.isArray(row.event_dates)
          ? row.event_dates
              .map((ed: any) => {
                const datePart = ed.date ?? ed.event_date ?? null;
                const timePart = ed.time ?? ed.event_time ?? '00:00:00';
                if (!datePart) return undefined;
                const iso = `${datePart}T${timePart}`;
                const d = new Date(iso);
                return isNaN(d.getTime()) ? undefined : d;
              })
              .filter((d: Date | undefined) => !!d) as Date[]
          : [];

        dates.sort((a, b) => a.getTime() - b.getTime());

        const artists: string[] = Array.isArray(row.event_artists)
          ? row.event_artists.map((a: any) => `${a.fname ?? ''} ${a.lname ?? ''}`.trim()).filter((n: string) => n.length > 0)
          : [];
        const instruments: string[] = Array.isArray(row.instruments)
          ? row.instruments.map((i: any) => i.instrument).filter((s: string) => !!s)
          : [];

        const earliestDate = dates.length > 0 ? dates[0] : undefined as unknown as Date;
        const latestDate = dates.length > 0 ? dates[dates.length - 1] : undefined as unknown as Date;

        const statusNum: number = typeof row.status === 'number' ? row.status : (row.status === 'active' ? 1 : 2);

        return {
          id: row.id,
          event: row.event ?? '',
          programme: row.programme ?? '',
          title: row.title ?? '',
          location: row.location ?? row.location_addresss ?? '',
          eventDates: dates,
          status: statusNum as 1 | 2,
          eventType: row.event_type ?? '',
          artists,
          instruments,
          artistsJoined: artists.join(', '),
          instrumentsJoined: instruments.join(', '),
          earliestDate,
          latestDate
        } as EventRow;
      });
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }
}

export interface EventRow {
  id: number;
  event: string; // e.g., concert
  programme: string; // e.g., festival
  title: string;
  location: string;
  eventDates: Date[];
  status: 1 | 2; // 1 active, 2 inactive
  eventType: string;
  artists: string[];
  instruments: string[];
  artistsJoined: string;
  instrumentsJoined: string;
  earliestDate: Date;
  latestDate: Date;
}
