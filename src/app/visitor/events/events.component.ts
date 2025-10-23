import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { VisitorService } from '../../services/visitor.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit {

	constructor(
		private eventService: EventService,
		private router: Router,
		private visitorService: VisitorService
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
	selectedEditionName: string = '';
	sortBy: 'date-asc' | 'date' | 'edition' | 'event_type' | 'edition_type' | 'event_domain' = 'date';

	// Option lists
	programmeOptions: string[] = [];
	typeOptions: string[] = [];
	editionNameOptions: string[] = [];

	// UI toggles per event id
	private expandedDates: Set<any> = new Set<any>();

	async ngOnInit(): Promise<void> {
		await this.loadEvents();
		   this.visitorService.setRouteID(2);
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
		const showsRaw = Array.isArray(raw?.event_dates)
			? raw.event_dates.map((d: any) => ({ date: d?.date, time: d?.time, location: d?.location }))
			: [];
		const shows = showsRaw.sort((a: any, b: any) => {
			const toMs = (s: any): number => {
				const dt = new Date(s?.date);
				if (isNaN(dt.getTime())) return 0;
				const timeStr = (s?.time || '').toString();
				if (timeStr) {
					const parts = timeStr.split(':');
					const hours = parseInt(parts[0] || '0', 10);
					const minutes = parseInt(parts[1] || '0', 10);
					if (!isNaN(hours) && !isNaN(minutes)) {
						dt.setHours(hours, minutes, 0, 0);
					}
				} else {
					// If no time, treat as end of day
					dt.setHours(23, 59, 59, 999);
				}
				return dt.getTime();
			};
			return toMs(a) - toMs(b); // earliest first
		});
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
		const showTimes: number[] = Array.isArray(shows)
			? shows.map(s => new Date(s?.date as any).getTime()).filter(t => !isNaN(t))
			: [];
		const startOfToday = new Date();
		startOfToday.setHours(0, 0, 0, 0);
		let statusNormalized: 'upcoming' | 'completed' | '' = '';
		if (showTimes.length > 0) {
			const latestShow = Math.max(...showTimes);
			statusNormalized = latestShow < startOfToday.getTime() ? 'completed' : 'upcoming';
		}
		const isCompleted = Boolean((raw as any)?.is_completed) || statusNormalized === 'completed';
		const instruments = Array.isArray(raw?.event_instruments)
			? raw.event_instruments.map((i: any) => ({ instrument: i?.name || '' })).filter((x: any) => !!x.instrument)
			: [];
		const firstShowLocation = shows.length > 0 ? (shows[0]?.location || '') : '';
		return {
			...raw,
			rawStatus: raw?.status,
			id: raw?.id ?? raw?.id_event ?? null,
			title: raw?.title || raw?.name || '',
			description: raw?.teaser || raw?.description || '',
			location: firstShowLocation || raw?.location || raw?.location_addresss || '',
			programme: raw?.edition_type || '',
			eventType: raw?.event_type || raw?.event || '',
			edition: raw?.edition || '',
			editionType: raw?.edition_type || '',
			eventDomain: raw?.event_domain || '',
			status: isCompleted ? 'completed' : statusNormalized,
			shows,
			imageUrl: raw?.photo || raw?.cover_image || '',
			artistDisplay,
			editionDisplay,
			instruments,
			isCompleted,
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

	onEditionNameChange(value: string): void {
		this.selectedEditionName = value || '';
		this.applyFilters();
	}

	onSortChange(value: 'date' | 'date-asc' | 'edition' | 'event_type' | 'edition_type' | 'event_domain'): void {
		this.sortBy = value || 'date';
		this.applyFilters();
	}

	clearFilters(): void {
		this.searchTerm = '';
		this.selectedProgramme = '';
		this.selectedType = '';
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
		const edNameLc = (this.selectedEditionName || '').toLowerCase();

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

				const editionNameStr = (ev?.editionDisplay || ev?.edition || '').toString().toLowerCase();
				const matchesEditionName = edNameLc.length === 0 ? true : editionNameStr === edNameLc;

				const dateMs = this.getPrimaryDateMs(ev);
				const derivedStatus: 'upcoming' | 'completed' | '' = isNaN(dateMs) ? ((ev?.status as any) || '') : (dateMs >= now ? 'upcoming' : 'completed');
				const _evStatus = ((ev?.status as any) || derivedStatus) as 'upcoming' | 'completed' | '';

				return matchesSearch && matchesProgramme && matchesType && matchesEditionName;
			})
			.sort((a: any, b: any) => {
				if (this.sortBy === 'date' || this.sortBy === 'date-asc') {
					const da = this.getPrimaryDateMs(a);
					const db = this.getPrimaryDateMs(b);
					if (isNaN(da) && isNaN(db)) return 0;
					if (isNaN(da)) return 1;
					if (isNaN(db)) return -1;
					return this.sortBy === 'date-asc' ? (db - da) : (da - db);
				}
				const getStr = (ev: any): string => {
					switch (this.sortBy) {
						case 'edition': return (ev?.editionDisplay || ev?.edition || '').toString();
						case 'event_type': return (ev?.eventType || '').toString();
						case 'edition_type': return (ev?.editionType || ev?.programme || '').toString();
						case 'event_domain': return (ev?.eventDomain || '').toString();
						default: return '';
					}
				};
				return getStr(a).localeCompare(getStr(b));
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
		const editionNameSet = new Set<string>();
		for (const ev of this.allEvents) {
			const prog = (ev?.programme || ev?.editionType || '').toString().trim();
			if (prog) programmeSet.add(prog);
			const type = (ev?.eventType || '').toString().trim();
			if (type) typeSet.add(type);
			const edName = (ev?.editionDisplay || ev?.edition || '').toString().trim();
			if (edName) editionNameSet.add(edName);
		}
		this.programmeOptions = Array.from(programmeSet).sort((a, b) => a.localeCompare(b));
		this.typeOptions = Array.from(typeSet).sort((a, b) => a.localeCompare(b));
		this.editionNameOptions = Array.from(editionNameSet).sort((a, b) => a.localeCompare(b));
	}

	isShowPast(show: any): boolean {
		if (!show) return false;
		const dateInput = show?.date;
		if (!dateInput) return false;
		const dt = new Date(dateInput);
		if (isNaN(dt.getTime())) return false;
		const timeStr = (show?.time || '').toString();
		if (timeStr) {
			const parts = timeStr.split(':');
			const hours = parseInt(parts[0] || '0', 10);
			const minutes = parseInt(parts[1] || '0', 10);
			if (!isNaN(hours) && !isNaN(minutes)) {
				dt.setHours(hours, minutes, 0, 0);
			}
		} else {
			// Without time, consider the show active until end of its day
			dt.setHours(23, 59, 59, 999);
		}
		return dt.getTime() < Date.now();
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
