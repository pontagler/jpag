import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ArtistService } from '../../services/artist.service';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  
})
export class ProfileComponent implements OnInit {

constructor(private router: Router,
  private authSerivce: AuthService,
  private artistService: ArtistService // Assuming you have an ArtistService to fetch artist data 

) { }
  async ngOnInit(): Promise<void> {
    // Ensure user ID is available on refresh
    const uid = this.authSerivce.sigUserID();
    if (!uid) {
      const user = await this.authSerivce.getCurrentUser();
      this.artistProfileID = user?.id || null;
    } else {
      this.artistProfileID = uid;
    }
    if (this.artistProfileID) {
      this.getArtistProfile();
    }
    this.isActiveTab(1);
  }


  getArtistProfile() {
  this.artistService.getArtistFullProfile(this.artistProfileID).then(full => {
    const raw = full || {};
    const artist = raw.artist || {};

    const instruments = Array.isArray(raw.instruments)
      ? raw.instruments.map((i: any) => ({
          ...i,
          instrument: i?.instrument_name ?? i?.instrument ?? '',
          inst_color: i?.color ?? i?.inst_color ?? 'gray'
        }))
      : [];

    const performance = Array.isArray(raw.performance_type)
      ? raw.performance_type.map((p: any) => ({
          id_performance: p?.id_performance ?? p?.id ?? null,
          performance_type: p?.performance_type ?? p?.name ?? ''
        }))
      : [];

    const education = Array.isArray(raw.education) ? raw.education : [];
    const awards = Array.isArray(raw.awards) ? raw.awards : [];

    const media = Array.isArray(raw.media) ? raw.media : [];
    const media_video = media.filter((m: any) => (m?.id_media ?? m?.id_media_type) === 1);
    const media_cd = media.filter((m: any) => (m?.id_media ?? m?.id_media_type) === 2);

    const profile = {
      ...artist,
      instruments,
      performance_type: performance,
      education,
      awards,
      media_video,
      media_cd,
      requests: Array.isArray(raw.requests) ? raw.requests : [],
      availability: Array.isArray(raw.availability) ? raw.availability : [],
      requirements: Array.isArray(raw.requirements) ? raw.requirements : []
    };

    this.artistProfile = profile;
    console.log('Artist Full Profile (normalized):', this.artistProfile);
    this.artistService.setArtistProfile(profile);
    if (artist?.id) {
      this.artistService.setArtistID(artist.id);
    }
  }).catch(error => {
    console.error('Error fetching artist full profile:', error);
  });
}


profileArtist:any = signal<string[]>([]);
activeTab:number = 1;

artistProfileID:any;
artistProfile:any = [];

 

isActiveTab(id:number){
  this.activeTab = id;
  
  switch(id){
    
    case 1: 
  console.log(id);
    this.router.navigate(['/artistspace/profile/artist']);
    break;
    case 2:
      console.log(id);
    this.router.navigate(['/artistspace/profile/instruments']); 
  break;
case 3:
  console.log(id);
    this.router.navigate(['/artistspace/profile/media']);
break;
case 4:
  console.log(id);
    this.router.navigate(['/artistspace/profile/requests']);
break;

case 5:
  console.log(id);
    this.router.navigate(['/artistspace/profile/events']);
break;

case 6:

    this.router.navigate(['/artistspace/profile/account']);
break;

case 7:

    this.router.navigate(['/artistspace/profile/requirement']);
break;

case 8:

    this.router.navigate(['/artistspace/profile/timeoff']);
break;

default:
    this.router.navigate(['/artistspace/profile/artist']);
}

}
}