import { Component, effect, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { ArtistService } from '../../../services/artist.service';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-artist',
  
  templateUrl: './artist.component.html',
  standalone:false
})
export class ArtistComponent implements OnInit {
  constructor(
    private router: Router, 
    private artistService: ArtistService,
    private alertService: AlertService
  ) {
    effect(() => {
      this.profileID = this.artistService.getArtistProfileID();
      console.log(this.profileID);
    });
  }

  ngOnInit (){
    this.getAllArtists(); 
  }



  // Filters
  profileID:any;
  nameQuery: string = '';
  statusFilter: 'All' | 'Active' | 'Inactive' = 'All';
  cityFilter: 'All' | string = 'All';
  upcomingFilter: 'All' | 'Yes' | 'No' = 'All';

  // Sorting
  sortKey: keyof Artist = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';


  get uniqueCities(): string[] {
    const cities = new Set<string>();
    for (const artist of this.artists) {
      if (artist.city && artist.city.trim().length > 0) {
        cities.add(artist.city);
      }
    }
    return Array.from(cities).sort((a, b) => a.localeCompare(b));
  }

  get displayedArtists(): Artist[] {
    // Filter
    let result = this.artists.filter((a) => {
      const matchesName = this.nameQuery
        ? a.name.toLowerCase().includes(this.nameQuery.toLowerCase())
        : true;
      const matchesStatus =
        this.statusFilter === 'All' ? true : a.status === this.statusFilter;
      const matchesCity =
        this.cityFilter === 'All' ? true : a.city === this.cityFilter;
      const matchesUpcoming =
        this.upcomingFilter === 'All'
          ? true
          : this.upcomingFilter === 'Yes'
          ? a.upcomingEvents > 0
          : a.upcomingEvents === 0;
      return matchesName && matchesStatus && matchesCity && matchesUpcoming;
    });

    // Sort
    const key = this.sortKey;
    const dir = this.sortDirection === 'asc' ? 1 : -1;
    result.sort((a: Artist, b: Artist) => {
      const va = a[key];
      const vb = b[key];

      // Handle Date
      if (va instanceof Date && vb instanceof Date) {
        return (va.getTime() - vb.getTime()) * dir;
      }

      // Numbers
      if (typeof va === 'number' && typeof vb === 'number') {
        return (va - vb) * dir;
      }

      // Booleans
      if (typeof va === 'boolean' && typeof vb === 'boolean') {
        return ((va === vb ? 0 : va ? 1 : -1) as number) * dir;
      }

      // Strings and fallback
      return String(va).localeCompare(String(vb)) * dir;
    });

    return result;
  }

  setSort(key: keyof Artist): void {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }
  }

  createNew(): void {
    this.router.navigate(['/hosts/console/artists/create']);
  }

artists: Artist[] = [] ;
  allArtistArr:any = [];

  async getAllArtists(){
    try {
      const res = await this.artistService.getAllArtists();
      this.artists = (res || []).map((row: any) => {
        const firstName = row.fname || row.first_name || '';
        const lastName = row.lname || row.last_name || '';
        const fullName = row.name || `${firstName} ${lastName}`.trim();

        const createdOnRaw = row.createdon ?? row.created_on ?? row.created_at ?? null;
        const createdOnDate = createdOnRaw ? new Date(createdOnRaw) : undefined as unknown as Date;

        return {
          id: row.id,
          name: fullName,
          phone: row.phone ?? '',
          email: row.email ?? '',
          city: row.city ?? '',
          country: row.country ?? '',
          isFeatured: (row.isFeatured ?? row.is_featured ?? false) as boolean,
          upcomingEvents: (row.upcomingEvents ?? row.upcoming_events ?? 0) as number,
          totalEvents: (row.totalEvents ?? row.total_events ?? 0) as number,
          status: row.status ?? (row.is_active === false ? 'Inactive' : 'Active'),
          createdOn: createdOnDate,
        } as Artist;
      });
    } catch (error:any) {
      this.alertService.showAlert('Internal Error', error.message, 'error');
    }
  }

navigateTo(id:any){
  this.router.navigate([`hosts/console/artists/${id}`]);
}



}

export interface Artist {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  isFeatured: boolean;
  upcomingEvents: number;
  totalEvents: number;
  status: string;
  createdOn: Date;
}


@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, length: number = 8): string {
    if (!value) return '';
    return value.substring(0, length);
  }



}
