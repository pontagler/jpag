import { Component, effect } from '@angular/core';
import { ArtistService } from '../../../services/artist.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-instruments',
  imports: [NgClass],
  templateUrl: './instruments.component.html',
  
})
export class InstrumentsComponent {

  constructor(
    private artistService: ArtistService
  ) { 

    effect(() => {
    this.artistProfile = this.artistService.getArtistProfilebyID();
  });


}

artistProfile:any= [];
}
