import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from "../../shared/shared.module";
import { VisitorService } from '../../services/visitor.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-artists',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, TitleCasePipe],
  templateUrl: './artists.component.html'
})
export class ArtistsComponent implements OnInit{

  constructor(
    private visitorService: VisitorService,
    private alertService: AlertService
  ){

  }

  ngOnInit(): void {
    if (!this.allArtists || this.allArtists.length === 0) {
      this.getArtistForVisitor();
    }
  }

  allArtists: any[] = [];
  filteredArtists: any[] = [];
  searchTerm: string = '';
  viewMode: 'grid' | 'list' = 'grid';
  showFilters: boolean = false;

  // Filters
  instrumentOptions: string[] = [];
  performanceOptions: string[] = [];
  selectedInstrument: string = '';
  selectedPerformance: string = '';
  nameSort: 'asc' | 'desc' = 'asc';

  async getArtistForVisitor(): Promise<void> {
    try {
      const artists = await this.visitorService.getArtistForVisitor();
      this.allArtists = Array.isArray(artists) ? artists : [];
      this.filteredArtists = [...this.allArtists];
      this.computeOptionLists();
    } catch (error: any) {
      this.alertService.showAlert('Internal Error', error?.message || 'Unknown error', 'error');
      this.allArtists = [];
      this.filteredArtists = [];
      this.instrumentOptions = [];
      this.performanceOptions = [];
    }
  }

  onSearchChange(term: any): void {
    this.searchTerm = (term ?? '').toString();
    this.applyFilter();
  }

  private applyFilter(): void {
    const trimmed = this.searchTerm.trim().toLowerCase();
    const selectedInstrumentLc = (this.selectedInstrument || '').toLowerCase();
    const selectedPerformanceLc = (this.selectedPerformance || '').toLowerCase();

    this.filteredArtists = this.allArtists.filter((artist) => {
      const matchesSearch = trimmed.length === 0 ? true : this.artistMatchesSearch(artist, trimmed);
      const matchesInstrument = selectedInstrumentLc.length === 0 ? true : this.artistHasInstrument(artist, selectedInstrumentLc);
      const matchesPerformance = selectedPerformanceLc.length === 0 ? true : this.artistHasPerformance(artist, selectedPerformanceLc);
      return matchesSearch && matchesInstrument && matchesPerformance;
    });

    this.sortByName(this.nameSort);
  }

  private artistMatchesSearch(artist: any, term: string): boolean {
    const fname = (artist?.fname || '').toString().toLowerCase();
    const lname = (artist?.lname || '').toString().toLowerCase();
    const nameMatches = (`${fname} ${lname}`.trim()).includes(term) || fname.includes(term) || lname.includes(term);

    const instrumentsArr = Array.isArray(artist?.instruments) ? artist.instruments : [];
    const instrumentMatches = instrumentsArr.some((inst: any) => (inst?.instrument || '').toString().toLowerCase().includes(term));

    const performancesArr = Array.isArray(artist?.performance) ? artist.performance : [];
    const performanceMatches = performancesArr.some((perf: any) => (perf?.performance || '').toString().toLowerCase().includes(term));

    return nameMatches || instrumentMatches || performanceMatches;
  }

  private artistHasInstrument(artist: any, instrumentLc: string): boolean {
    const instrumentsArr = Array.isArray(artist?.instruments) ? artist.instruments : [];
    return instrumentsArr.some((inst: any) => (inst?.instrument || '').toString().toLowerCase() === instrumentLc);
  }

  private artistHasPerformance(artist: any, performanceLc: string): boolean {
    const performancesArr = Array.isArray(artist?.performance) ? artist.performance : [];
    return performancesArr.some((perf: any) => (perf?.performance || '').toString().toLowerCase() === performanceLc);
  }

  private sortByName(direction: 'asc' | 'desc'): void {
    const compare = (a: any, b: any) => {
      const aName = `${a?.fname || ''} ${a?.lname || ''}`.trim().toLowerCase();
      const bName = `${b?.fname || ''} ${b?.lname || ''}`.trim().toLowerCase();
      const result = aName.localeCompare(bName);
      return direction === 'asc' ? result : -result;
    };
    this.filteredArtists.sort(compare);
  }

  onInstrumentChange(value: string): void {
    this.selectedInstrument = value || '';
    this.applyFilter();
  }

  onPerformanceChange(value: string): void {
    this.selectedPerformance = value || '';
    this.applyFilter();
  }

  onNameSortChange(value: 'asc' | 'desc'): void {
    this.nameSort = value || 'asc';
    this.sortByName(this.nameSort);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedInstrument = '';
    this.selectedPerformance = '';
    this.nameSort = 'asc';
    this.filteredArtists = [...this.allArtists];
    this.sortByName(this.nameSort);
  }

  private computeOptionLists(): void {
    const instrumentSet = new Set<string>();
    const performanceSet = new Set<string>();
    for (const artist of this.allArtists) {
      const instrumentsArr = Array.isArray(artist?.instruments) ? artist.instruments : [];
      for (const inst of instrumentsArr) {
        const name = (inst?.instrument || '').toString().trim();
        if (name) instrumentSet.add(name);
      }
      const performancesArr = Array.isArray(artist?.performance) ? artist.performance : [];
      for (const perf of performancesArr) {
        const name = (perf?.performance || '').toString().trim();
        if (name) performanceSet.add(name);
      }
    }
    this.instrumentOptions = Array.from(instrumentSet).sort((a, b) => a.localeCompare(b));
    this.performanceOptions = Array.from(performanceSet).sort((a, b) => a.localeCompare(b));
  }


}
