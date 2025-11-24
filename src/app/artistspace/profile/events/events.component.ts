import { DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ArtistService } from '../../../services/artist.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [ NgFor, NgIf],
  templateUrl: './events.component.html',
  
})
export class EventsComponent implements OnInit {
  constructor(private artistService: ArtistService) {}

  events: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  async ngOnInit(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      let artistId = this.artistService.getArtistID();
      if (!artistId) {
        const profile = this.artistService.getArtistProfilebyID();
        artistId = profile?.id;
      }
      if (!artistId) {
        this.events = [];
        this.loading = false;
        return;
      }
      this.events = await this.artistService.getEventsWithDates(artistId);
    } catch (e: any) {
      this.error = e?.message || 'Failed to load events';
    } finally {
      this.loading = false;
    }
  }
}
