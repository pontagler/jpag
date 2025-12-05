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
  editionTypeFilter: 'All' | string = 'All';
  eventDomainFilter: 'All' | string = 'All';
  statusFilter: 'All' | 0 | 1 | 2 | 3 = 'All';
  completedFilter: 'All' | 'Upcoming' | 'Past' = 'All';

  // Sorting
  sortKey: keyof EventRow = 'id';
  sortDirection: 'asc' | 'desc' = 'desc';

  events: EventRow[] = [];

  get uniqueEditionTypes(): string[] {
    const values = new Set<string>();
    for (const e of this.events) {
      if (e.editionType && e.editionType.trim().length > 0) values.add(e.editionType);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  get uniqueEventDomains(): string[] {
    const values = new Set<string>();
    for (const e of this.events) {
      if (e.eventDomain && e.eventDomain.trim().length > 0) values.add(e.eventDomain);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }

  get displayedEvents(): EventRow[] {
    // Filter
    let result = this.events.filter((e) => {
      const q = this.searchQuery.trim().toLowerCase();
      const matchesQuery = q
        ? (
            (e.title && e.title.toLowerCase().includes(q)) ||
            (e.editionType && e.editionType.toLowerCase().includes(q)) ||
            (e.eventDomain && e.eventDomain.toLowerCase().includes(q)) ||
            (e.id && e.id.toString().includes(q))
          )
        : true;

      const matchesEditionType = this.editionTypeFilter === 'All' ? true : e.editionType === this.editionTypeFilter;
      const matchesEventDomain = this.eventDomainFilter === 'All' ? true : e.eventDomain === this.eventDomainFilter;
      const matchesStatus = this.statusFilter === 'All' ? true : e.status === this.statusFilter;
      const matchesCompleted = this.completedFilter === 'All' ? true : e.isCompleted === this.completedFilter;

      return matchesQuery && matchesEditionType && matchesEventDomain && matchesStatus && matchesCompleted;
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
    this.editionTypeFilter = 'All';
    this.eventDomainFilter = 'All';
    this.statusFilter = 'All';
    this.completedFilter = 'All';
  }

  navigateTo(id: any): void {
    this.router.navigate([`hosts/console/events/${id}`]);
  }

  getStatusLabel(status: 0 | 1 | 2 | 3): string {
    switch (status) {
      case 0: return 'Live';
      case 1: return 'Artists Suggest';
      case 2: return 'Draft';
      case 3: return 'Pending';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: 0 | 1 | 2 | 3): string {
    switch (status) {
      case 0: return 'bg-green-100 text-green-800'; // Live
      case 1: return 'bg-purple-100 text-purple-800'; // Artists Suggest
      case 2: return 'bg-gray-100 text-gray-800'; // Draft
      case 3: return 'bg-yellow-100 text-yellow-800'; // Pending
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusIcon(status: 0 | 1 | 2 | 3): string {
    switch (status) {
      case 0: return 'fa-circle-check'; // Live
      case 1: return 'fa-user-plus'; // Artists Suggest
      case 2: return 'fa-file-lines'; // Draft
      case 3: return 'fa-clock'; // Pending
      default: return 'fa-circle';
    }
  }

  async getAllEvents() {
    try {
      const res = await this.eventService.getEventsList_v1();
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

        // Status: 0=Live, 1=Artists Suggest, 2=Draft, 3=Pending
        const statusNum: number = typeof row.status === 'number' ? row.status : 2;

        // is_completed: false = Upcoming, true = Past
        const isCompleted: 'Upcoming' | 'Past' = row.is_completed === true ? 'Past' : 'Upcoming';

        return {
          id: row.id,
          event: row.event ?? '',
          programme: row.programme ?? '',
          title: row.title ?? '',
          location: row.location ?? row.location_addresss ?? '',
          eventDates: dates,
          status: statusNum as 0 | 1 | 2 | 3,
          eventType: row.event_type ?? '',
          artists,
          instruments,
          artistsJoined: artists.join(', '),
          instrumentsJoined: instruments.join(', '),
          earliestDate,
          latestDate,
          editionType: row.edition_type ?? '',
          eventDomain: row.event_domain ?? '',
          isCompleted
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
  status: 0 | 1 | 2 | 3; // 0=Live, 1=Artists Suggest, 2=Draft, 3=Pending
  eventType: string;
  artists: string[];
  instruments: string[];
  artistsJoined: string;
  instrumentsJoined: string;
  earliestDate: Date;
  latestDate: Date;
  editionType: string;
  eventDomain: string;
  isCompleted: 'Upcoming' | 'Past';
}
