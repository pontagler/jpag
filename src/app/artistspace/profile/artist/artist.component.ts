import { Component, effect, signal} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ArtistService } from '../../../services/artist.service';
import { ProfileComponent } from '../profile.component';

@Component({
  selector: 'app-artist',
  templateUrl: './artist.component.html',
  standalone: false,
})
export class ArtistComponent {
constructor(
  
  private artistService: ArtistService, // Assuming you have an ArtistService to 
  
  

) {
    effect(() => {
    this.artistProfile = this.artistService.getArtistProfilebyID();
    console.log('Artist Profile:', this.artistProfile);
  });
}




artistProfile:any= [];


ngOnInit() {



}



}
