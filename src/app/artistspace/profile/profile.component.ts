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
  ngOnInit(): void {
this.artistProfileID = this.authSerivce.sigUserID();
this.getArtistProfile();
this.isActiveTab(1);
  }


  getArtistProfile() {
  this.artistService.getArtistProfile(this.artistProfileID).then(profile => {
    this.artistProfile = profile[0];
    console.log('Artist Profile:', this.artistProfile);
    this.artistService.setArtistProfile(profile[0]);
    this.artistService.setArtistID(profile[0].id);
  }).catch(error => {
    console.error('Error fetching artist profile:', error);
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
default:
    this.router.navigate(['/artistspace/profile/artist']);
}

}
}