import { Component, effect } from '@angular/core';
import { ArtistService } from '../../../services/artist.service';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-media',
  imports: [CommonModule],
  templateUrl: './media.component.html',
  
})
export class MediaComponent {

  constructor(
      private artistService: ArtistService, // Assuming you have an ArtistService to 
    
  ){
    effect(() => {
    this.artistProfile = this.artistService.getArtistProfilebyID();
    console.log('Artist Profile:', this.artistProfile);
  });

  

}

watchVideo(url: string): void {
  console.log('Opening video:', url);
  window.open(url, '_blank');
}


artistProfile:any= [];


}