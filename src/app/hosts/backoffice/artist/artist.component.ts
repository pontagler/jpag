import { Component, effect, OnInit, Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
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
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
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
  upcomingFilter: 'All' | 'Yes' | 'No' = 'All';

  // Sorting
  sortKey: keyof Artist = 'createdOn';
  sortDirection: 'asc' | 'desc' = 'desc';


  get displayedArtists(): Artist[] {
    // Filter
    let result = this.artists.filter((a) => {
      const matchesName = this.nameQuery
        ? a.name.toLowerCase().includes(this.nameQuery.toLowerCase())
        : true;
      const matchesStatus =
        this.statusFilter === 'All' ? true : a.status === this.statusFilter;
      const matchesUpcoming =
        this.upcomingFilter === 'All'
          ? true
          : this.upcomingFilter === 'Yes'
          ? a.upcomingEvents > 0
          : a.upcomingEvents === 0;
      
      return matchesName && matchesStatus && matchesUpcoming;
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
        // Map from vw_get_all_artists view columns
        const createdOnDate = row.created_on ? new Date(row.created_on) : undefined as unknown as Date;
        
        return {
          id: row.artist_id,
          name: row.artist_name ?? '',
          phone: row.phone ?? '',
          email: '',
          city: '',
          country: '',
          photo: row.photo ?? '',
          isFeatured: (row.is_featured ?? false) as boolean,
          upcomingEvents: parseInt(row.upcoming_events ?? 0, 10) as number,
          totalEvents: parseInt(row.total_events ?? 0, 10) as number,
          status: row.status === true ? 'Active' : 'Inactive',
          createdOn: createdOnDate,
        } as Artist;
      });
      // Trigger change detection
      this.cdr.detectChanges();
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
  photo: string;
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
  transform(value: any, length: number = 8): string {
    if (!value) return '';
    const strValue = String(value);
    return strValue.substring(0, length);
  }



}
