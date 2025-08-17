import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {

	constructor(
		private eventService: EventService,
		private router: Router
	) {}

	// Data
	allEvents: any[] = [];
	filteredEvents: any[] = [];

	// UI state
	isLoading: boolean = true;
	showFilters: boolean = false;
	viewMode: 'grid' | 'list' = 'grid';
	searchTerm: string = '';

	// Filter selections
	selectedProgramme: string = '';
	selectedType: string = '';
	selectedStatus: '' | 'upcoming' | 'past' = '';
	sortBy: 'date' | 'date-asc' = 'date';

	// Option lists
	programmeOptions: string[] = [];
	typeOptions: string[] = [];
	statusOptions: Array<'upcoming' | 'past'> = ['upcoming', 'past'];

	// UI toggles per event id
	private expandedDates: Set<any> = new Set<any>();

	async ngOnInit(): Promise<void> {
		await this.loadEvents();
	}

	private async loadEvents(): Promise<void> {
		this.isLoading = true;
		try {
			const data = await this.eventService.getEventsList();
			console.log('data', data)
			const arr = Array.isArray(data) ? data : [];
			this.allEvents = arr.map((raw: any) => this.normalizeEvent(raw));
			this.filteredEvents = [...this.allEvents];
			console.log(this.filteredEvents)
			this.computeOptionLists();
			this.applyFilters();
		} catch (error) {
			this.allEvents = [];
			this.filteredEvents = [];
			this.programmeOptions = [];
			this.typeOptions = [];
		} finally {
			this.isLoading = false;
		}
	}

	private normalizeEvent(raw: any): any {
		const shows = Array.isArray(raw?.event_dates)
			? raw.event_dates.map((d: any) => ({ date: d?.date, time: d?.time }))
			: [];
		const artistDisplay = Array.isArray(raw?.event_artists)
			? raw.event_artists.map((a: any) => `${(a?.fname || '').trim()} ${(a?.lname || '').trim()}`.trim()).filter((s: string) => !!s).join(', ')
			: '';
		const editionDisplay = [raw?.edition_name, raw?.edition_year].filter((v: any) => !!v).join(' ');
		const statusNormalized: 'upcoming' | 'past' | '' = typeof raw?.status === 'number'
			? (raw.status === 1 ? 'upcoming' : raw.status === 0 ? 'past' : '')
			: ((raw?.status || '') as string).toString().toLowerCase() as any;
		return {
			...raw,
			rawStatus: raw?.status,
			id: raw?.id ?? raw?.id_event ?? null,
			title: raw?.title || raw?.name || '',
			description: raw?.teaser || raw?.description || '',
			location: raw?.location || raw?.location_addresss || '',
			programme: raw?.programme || '',
			eventType: raw?.event_type || raw?.event || '',
			status: statusNormalized,
			shows,
			imageUrl: raw?.photo || raw?.cover_image || '',
			artistDisplay,
			editionDisplay,
			bookingUrl: raw?.booking_url || ''
		};
	}

	onSearchChange(term: any): void {
		this.searchTerm = (term ?? '').toString();
		this.applyFilters();
	}

	onProgrammeChange(value: string): void {
		this.selectedProgramme = value || '';
		this.applyFilters();
	}

	onTypeChange(value: string): void {
		this.selectedType = value || '';
		this.applyFilters();
	}

	onStatusChange(value: '' | 'upcoming' | 'past'): void {
		this.selectedStatus = (value as any) || '';
		this.applyFilters();
	}

	onSortChange(value: 'date' | 'date-asc'): void {
		this.sortBy = value || 'date';
		this.applyFilters();
	}

	clearFilters(): void {
		this.searchTerm = '';
		this.selectedProgramme = '';
		this.selectedType = '';
		this.selectedStatus = '';
		this.sortBy = 'date';
		this.filteredEvents = [...this.allEvents];
	}

	goToEventDetail(eventId: any): void {
		if (eventId === undefined || eventId === null) return;
		this.router.navigate(['events', eventId]);
	}

	private applyFilters(): void {
		const search = (this.searchTerm || '').trim().toLowerCase();
		const progLc = (this.selectedProgramme || '').toLowerCase();
		const typeLc = (this.selectedType || '').toLowerCase();
		const statusSel = this.selectedStatus;

		const now = new Date().getTime();

		this.filteredEvents = this.allEvents
			.filter((ev: any) => {
				const title = (ev?.title || '').toString().toLowerCase();
				const artist = (ev?.artistDisplay || '').toString().toLowerCase();
				const venue = (ev?.location || '').toString().toLowerCase();
				const matchesSearch = search.length === 0 ? true : (
					title.includes(search) || artist.includes(search) || venue.includes(search)
				);

				const programmeStr = (ev?.programme || '').toString().toLowerCase();
				const matchesProgramme = progLc.length === 0 ? true : programmeStr === progLc;

				const typeStr = (ev?.eventType || '').toString().toLowerCase();
				const matchesType = typeLc.length === 0 ? true : typeStr === typeLc;

				const dateMs = this.getPrimaryDateMs(ev);
				const derivedStatus: 'upcoming' | 'past' | '' = isNaN(dateMs) ? (ev?.status || '') as any : (dateMs >= now ? 'upcoming' : 'past');
				const evStatus = (ev?.status || '') as 'upcoming' | 'past' | '' || derivedStatus;
				const matchesStatus = !statusSel ? true : evStatus === statusSel;

				return matchesSearch && matchesProgramme && matchesType && matchesStatus;
			})
			.sort((a: any, b: any) => {
				const da = this.getPrimaryDateMs(a);
				const db = this.getPrimaryDateMs(b);
				if (isNaN(da) && isNaN(db)) return 0;
				if (isNaN(da)) return 1;
				if (isNaN(db)) return -1;
				return this.sortBy === 'date'
					? (db - da)
					: (da - db);
			});
	}

	private getPrimaryDateMs(ev: any): number {
		// Try multiple possible shapes
		const fromShows = Array.isArray(ev?.shows) && ev.shows.length > 0 ? new Date(ev.shows[0]?.date).getTime() : NaN;
		if (!isNaN(fromShows)) return fromShows;
		const fromDate = ev?.date || ev?.event_date || ev?.start_date;
		if (fromDate) {
			const t = new Date(fromDate).getTime();
			if (!isNaN(t)) return t;
		}
		return NaN;
	}

	private computeOptionLists(): void {
		const programmeSet = new Set<string>();
		const typeSet = new Set<string>();
		for (const ev of this.allEvents) {
			const prog = (ev?.programme || '').toString().trim();
			if (prog) programmeSet.add(prog);
			const type = (ev?.eventType || '').toString().trim();
			if (type) typeSet.add(type);
		}
		this.programmeOptions = Array.from(programmeSet).sort((a, b) => a.localeCompare(b));
		this.typeOptions = Array.from(typeSet).sort((a, b) => a.localeCompare(b));
	}

	isDatesExpanded(eventId: any): boolean {
		return this.expandedDates.has(eventId);
	}

	toggleDatesExpanded(eventId: any): void {
		if (this.expandedDates.has(eventId)) {
			this.expandedDates.delete(eventId);
		} else {
			this.expandedDates.add(eventId);
		}
	}
}
