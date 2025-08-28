import { Component, OnInit } from '@angular/core';
import { HostsService } from '../../../services/hosts.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  // Dashboard statistics (populated from service)
  upcomingEventsCount = 0;
  eventsThisMonthCount = 0;
  artistsCount = 0;
  locationsCount = 0;
  artistRequestsPendingCount = 0;

  constructor(private hostsService: HostsService) {}

  ngOnInit() {
    this.loadDashboardCounts();
  }

  private async loadDashboardCounts() {
    try {
      const result: any = await this.hostsService.getDashbaordCount();
      const row = Array.isArray(result) && result.length > 0 ? result[0] : result;
      this.upcomingEventsCount = row?.upcoming_events ?? 0;
      this.eventsThisMonthCount = row?.events_this_month ?? 0;
      this.artistsCount = row?.artist_count ?? 0;
      this.locationsCount = row?.location_count ?? 0;
      this.artistRequestsPendingCount = row?.artist_requests_pending ?? 0;
    } catch (error) {
      console.error('Failed to load dashboard counts', error);
    }
  }
}
