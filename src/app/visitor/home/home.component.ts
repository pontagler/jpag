import { Component, OnInit } from '@angular/core';
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
}

  upcomingEvents: Array<{
    title: string;
    artist: string;
    shows: Array<{ date: string; time: string }>;
    location: string;
    price: string;
    image: string;
    type: string;
    description: string;
    availability: string;
    instruments: string;
    programme: string;
  }> = [
    {
      title: 'Summer Celtic Festival',
      artist: 'Marie Dubois & Ensemble',
      shows: [
        { date: 'July 15, 2025', time: '8:00 PM' },
        { date: 'July 16, 2025', time: '8:00 PM' }
      ],
      location: 'Château de Josselin',
      price: 'From €35',
      image: 'assets/images/profile/c1.png',
      type: 'Festival',
      description: 'An enchanting evening of traditional Celtic music in a historic castle setting',
      availability: 'Limited seats',
      instruments: 'Violin, Flute, Harp',
      programme: 'Spring Festival 2025'
    },
    {
      title: 'Jazz Under the Stars',
      artist: 'Sophie Laurent Trio',
      shows: [
        { date: 'July 22, 2025', time: '7:30 PM' },
        { date: 'July 23, 2025', time: '8:00 PM' }
      ],
      location: 'Parc de la Préfecture, Vannes',
      price: 'From €28',
      image: 'assets/images/profile/0.7507112676618586.jpg',
      type: 'Concert',
      description: 'Contemporary jazz interpretations of Breton folk',
      availability: 'Available',
      instruments: 'Piano, Drums, Bass',
      programme: 'Season 2025'
    },
    {
      title: 'Acoustic Folk Evening',
      artist: 'Jean-Luc Martin',
      shows: [
        { date: 'Aug 5, 2025', time: '8:30 PM' },
        { date: 'Aug 6, 2025', time: '7:00 PM' }
      ],
      location: 'Théâtre de Lorient',
      price: 'From €42',
      image: 'assets/images/profile/user-b.png',
      type: 'Concert',
      description: 'Intimate acoustic performance featuring traditional and original compositions',
      availability: 'Selling fast',
      instruments: 'Guitar, Vocals',
      programme: 'Winter Festival 2025'
    },
    {
      title: 'Blues & Breton Fusion',
      artist: 'Pierre Moreau Quartet',
      shows: [
        { date: 'Aug 12, 2025', time: '9:00 PM' },
        { date: 'Aug 13, 2025', time: '8:00 PM' }
      ],
      location: 'La Cigale, Nantes',
      price: 'From €38',
      image: 'assets/images/logo/logo.jpg',
      type: 'Concert',
      description: 'A unique fusion of American blues and traditional Breton melodies',
      availability: 'Available',
      instruments: 'Saxophone, Guitar, Drums',
      programme: 'Summer Festival 2025'
    }
  ];

  featuredArtists: Array<{
    name: string;
    instrument: string;
    genre: string;
    image: string;
    bio: string;
    rating: number;
    concerts: number;
  }> = [
    {
      name: 'Marie Dubois',
      instrument: 'Classical Violin',
      genre: 'Classical & Folk',
      image: 'assets/images/profile/user-b.png',
      bio: 'Renowned violinist specializing in Breton traditional music',
      rating: 4.9,
      concerts: 45
    },
    {
      name: 'Jean-Luc Martin',
      instrument: 'Acoustic Guitar',
      genre: 'Folk & Celtic',
      image: 'assets/images/profile/user-b.png',
      bio: 'Master of Celtic guitar with 20 years of experience',
      rating: 4.8,
      concerts: 38
    },
    {
      name: 'Sophie Laurent',
      instrument: 'Piano & Vocals',
      genre: 'Jazz & Contemporary',
      image: 'assets/images/profile/user-b.png',
      bio: 'Jazz pianist bringing modern interpretations to traditional songs',
      rating: 4.9,
      concerts: 52
    },
    {
      name: 'Pierre Moreau',
      instrument: 'Saxophone',
      genre: 'Jazz & Blues',
      image: 'assets/images/profile/user-b.png',
      bio: 'Saxophone virtuoso blending jazz with Breton influences',
      rating: 4.7,
      concerts: 41
    }
  ];

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
