import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { VisitorService } from '../../services/visitor.service';

interface EventDateItem {
  date: string | Date | null | undefined;
  time: string | null | undefined;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  constructor(private router: Router, private alertService:AlertService, private visitorService:VisitorService) {}

ngOnInit(): void {
  this.getUpcomingEvents();
  this.visitorService.setRouteID(1);
}

  goToEvents(): void {
    this.router.navigate(['events']);
  }

  goToArtists(): void {
    this.router.navigate(['artists']);
  }

eventArray:any = [];
expandedEvents: boolean[] = [];

async getUpcomingEvents(){

try{
  this.visitorService.getUpcomingEvents().then((res)=>{
    this.getFeaturedArtist();
    this.eventArray = res;
    this.expandedEvents = new Array(this.eventArray?.length || 0).fill(false);
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
    return this.expandedEvents[index] ? dates.slice(0, 5) : dates.slice(0, 2);
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

}
