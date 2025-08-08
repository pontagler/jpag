import { Component, effect } from '@angular/core';
import { Router } from '@angular/router';
import { ArtistService } from '../../../services/artist.service';

@Component({
  selector: 'app-artist',
  
  templateUrl: './artist.component.html',
  standalone:false
})
export class ArtistComponent {
  constructor(private router: Router, private artistService: ArtistService) {
    effect(() => {
      this.profileID = this.artistService.getArtistProfileID();
      console.log(this.profileID);
    });
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

  // Mock data – replace with API integration later
  artists: Artist[] = [
    {
      id: 'ART-1001',
      name: 'Alice Johnson',
      phone: '+1 555-0123',
      email: 'alice@example.com',
      city: 'New York',
      country: 'USA',
      isFeatured: true,
      upcomingEvents: 2,
      totalEvents: 12,
      status: 'Active',
      createdOn: new Date('2024-11-12')
    },
    {
      id: 'ART-1002',
      name: 'Bharat Singh',
      phone: '+91 98765 43210',
      email: 'bharat@example.in',
      city: 'Mumbai',
      country: 'India',
      isFeatured: false,
      upcomingEvents: 0,
      totalEvents: 4,
      status: 'Inactive',
      createdOn: new Date('2023-08-01')
    },
    {
      id: 'ART-1003',
      name: 'Clara Gómez',
      phone: '+34 600 123 456',
      email: 'clara@example.es',
      city: 'Madrid',
      country: 'Spain',
      isFeatured: true,
      upcomingEvents: 1,
      totalEvents: 7,
      status: 'Active',
      createdOn: new Date('2025-02-14')
    },
    {
      id: 'ART-1004',
      name: 'Diego Silva',
      phone: '+55 21 99999-8888',
      email: 'diego@example.br',
      city: 'Rio de Janeiro',
      country: 'Brazil',
      isFeatured: false,
      upcomingEvents: 3,
      totalEvents: 20,
      status: 'Active',
      createdOn: new Date('2024-05-30')
    },
    {
      id: 'ART-1005',
      name: 'Emma Smith',
      phone: '+44 20 7946 0958',
      email: 'emma@example.co.uk',
      city: 'London',
      country: 'UK',
      isFeatured: false,
      upcomingEvents: 0,
      totalEvents: 2,
      status: 'Inactive',
      createdOn: new Date('2022-12-22')
    }
  ];

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
  status: 'Active' | 'Inactive';
  createdOn: Date;
}
